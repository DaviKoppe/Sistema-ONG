import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ModalConfirmacaoProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  isLoading?: boolean;
}

const ModalConfirmacao = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Excluir",
  isLoading = false,
}: ModalConfirmacaoProps) => (
  <AlertDialog open={open} onOpenChange={onOpenChange}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel type="button">Cancelar</AlertDialogCancel>
        <AlertDialogAction
          type="button"
          onClick={onConfirm}
          disabled={isLoading}
          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
        >
          {isLoading ? "Excluindo…" : confirmText}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

export default ModalConfirmacao;
