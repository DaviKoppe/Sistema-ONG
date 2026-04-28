from django.urls import path

from . import api_views


urlpatterns = [
    path("login/", api_views.login_view, name="api_login"),
    path("logout/", api_views.logout_view, name="api_logout"),
    path("me/", api_views.me_view, name="api_me"),
]

