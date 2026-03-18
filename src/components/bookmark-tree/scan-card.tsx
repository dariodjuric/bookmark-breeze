import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Link2Off } from 'lucide-react';

export default function ScanCard() {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-3">
        <Link2Off className="h-4 w-4 text-primary" />
        <CardTitle className="font-display text-base">Broken Links</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="py-4">
        <p className="text-sm text-muted-foreground mb-4">
          Scan your bookmarks to find broken or unreachable links.
        </p>
        <Button className="w-full" variant="outline">
          <Link2Off className="h-4 w-4" />
          Scan for Broken Links
        </Button>
      </CardContent>
    </Card>
  );
}
