import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBookmarkStore } from '@/stores/bookmark-store';
import { Settings } from 'lucide-react';

export default function SettingsCard() {
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );
  const updateSettings = useBookmarkStore((state) => state.updateSettings);

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-row items-center gap-2 px-4 py-3">
        <Settings className="h-4 w-4 text-primary" />
        <CardTitle className="font-display text-base">Settings</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 py-4">
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Confirm before delete</span>
            <span className="text-xs text-muted-foreground">
              Ask before removing bookmarks
            </span>
          </div>
          <Switch
            checked={confirmDeletions}
            onCheckedChange={(checked) =>
              updateSettings({ confirmDeletions: checked })
            }
          />
        </label>
      </CardContent>
    </Card>
  );
}
