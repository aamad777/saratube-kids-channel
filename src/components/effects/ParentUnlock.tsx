import { Button } from "@/components/ui/button";

const ParentUnlock = ({ onUnlock }: { onUnlock?: () => void }) => {
  return (
    <Button onClick={() => onUnlock?.()}>
      Parent Unlock
    </Button>
  );
};

export default ParentUnlock;
