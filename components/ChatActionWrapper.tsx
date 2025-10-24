import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export function ChatActionWrapper({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-full sm:min-w-[600px] md:min-w-[800px] h-auto max-h-[80vh] overflow-y-auto px-0">{children}</DialogContent>
    </Dialog>
  );
}
