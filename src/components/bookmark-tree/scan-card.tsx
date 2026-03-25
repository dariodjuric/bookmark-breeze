import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useBookmarkStore } from '@/stores/bookmark-store';
import { useScanStore } from '@/stores/scan-store';
import { Link2Off, X } from 'lucide-react';

export default function ScanCard() {
  const scanStatus = useScanStore((s) => s.scanStatus);
  const brokenIds = useScanStore((s) => s.brokenIds);
  const scanProgress = useScanStore((s) => s.scanProgress);
  const scanTotal = useScanStore((s) => s.scanTotal);
  const permissionDenied = useScanStore((s) => s.permissionDenied);
  const startScan = useScanStore((s) => s.startScan);
  const cancelScan = useScanStore((s) => s.cancelScan);
  const clearResults = useScanStore((s) => s.clearResults);

  const bookmarksOrFolders = useBookmarkStore((s) => s.bookmarksOrFolders);

  const progressPercent = scanTotal > 0 ? (scanProgress / scanTotal) * 100 : 0;

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-3">
        <Link2Off className="h-4 w-4 text-primary" />
        <CardTitle className="font-display text-base">Broken Links</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-4">
        {scanStatus === 'idle' && <IdleContent />}
        {scanStatus === 'scanning' && (
          <ScanningContent
            progress={scanProgress}
            total={scanTotal}
            brokenCount={brokenIds.size}
            progressPercent={progressPercent}
            onCancel={cancelScan}
          />
        )}
        {scanStatus === 'done' && (
          <DoneContent brokenCount={brokenIds.size} onScanAgain={handleScanAgain} />
        )}
        {permissionDenied && (
          <p className="text-xs text-destructive mt-2">
            Permission is required to check links. Please allow access when
            prompted.
          </p>
        )}
      </CardContent>
    </Card>
  );

  function handleScanAgain() {
    clearResults();
    startScan(bookmarksOrFolders);
  }

  function IdleContent() {
    return (
      <>
        <p className="text-sm text-muted-foreground mb-4">
          Scan your bookmarks to find broken or unreachable links.
        </p>
        <Button
          className="w-full"
          onClick={() => startScan(bookmarksOrFolders)}
        >
          <Link2Off className="h-4 w-4" />
          Scan for Broken Links
        </Button>
      </>
    );
  }
}

interface ScanningContentProps {
  progress: number;
  total: number;
  brokenCount: number;
  progressPercent: number;
  onCancel: () => void;
}

function ScanningContent({
  progress,
  total,
  brokenCount,
  progressPercent,
  onCancel,
}: ScanningContentProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">
          Scanning… {progress}/{total}
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onCancel}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <Progress value={progressPercent} />
      <p className="text-xs text-muted-foreground">
        {brokenCount} potentially broken {brokenCount === 1 ? 'link' : 'links'} found
      </p>
    </div>
  );
}

interface DoneContentProps {
  brokenCount: number;
  onScanAgain: () => void;
}

function DoneContent({ brokenCount, onScanAgain }: DoneContentProps) {
  return (
    <>
      <p className="text-sm font-medium mb-1">Scan complete</p>
      <p className="text-sm text-muted-foreground mb-4">
        {brokenCount > 0
          ? `${brokenCount} potentially broken ${brokenCount === 1 ? 'link' : 'links'} found`
          : 'All links are healthy!'}
      </p>
      <Button className="w-full" variant="outline" onClick={onScanAgain}>
        <Link2Off className="h-4 w-4" />
        Scan Again
      </Button>
    </>
  );
}
