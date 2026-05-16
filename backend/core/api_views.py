import json

from django.contrib.auth import authenticate, login, logout
from django.http import HttpRequest, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def _json_error(message: str, *, status: int = 400):
    return JsonResponse({"ok": False, "error": message}, status=status)


@require_http_methods(["GET"])
def me_view(request: HttpRequest):
    user = request.user
    if not user.is_authenticated:
        return JsonResponse({"ok": True, "authenticated": False})
    return JsonResponse(
        {
            "ok": True,
            "authenticated": True,
            "user": {
                "id": user.id,
                "username": user.username,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def login_view(request: HttpRequest):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except json.JSONDecodeError:
        return _json_error("JSON inválido.")

    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""
    if not username or not password:
        return _json_error("Informe username e password.")

    user = authenticate(request, username=username, password=password)
    if user is None:
        return _json_error("Credenciais inválidas.", status=401)

    login(request, user)
    return JsonResponse({"ok": True, "username": user.username})


@csrf_exempt
@require_http_methods(["POST"])
def logout_view(request: HttpRequest):
    logout(request)
    return JsonResponse({"ok": True})

