import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useBookmarkStore } from '@/stores/bookmark-store';
import { Eye, Settings, Trash2 } from 'lucide-react';

export default function SettingsCard() {
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );
  const expandAllByDefault = useBookmarkStore(
    (state) => state.settings.expandAllByDefault
  );
  const updateSettings = useBookmarkStore((state) => state.updateSettings);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Settings className="size-4! text-muted-foreground" />
          <CardTitle className="text-base">Settings</CardTitle>
        </div>
        <CardDescription>Customize your editing experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="confirm-delete" className="text-sm font-normal">
              Confirm before delete
            </Label>
          </div>
          <Switch
            id="confirm-delete"
            checked={confirmDeletions}
            onCheckedChange={(checked) =>
              updateSettings({ confirmDeletions: checked })
            }
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            <Label htmlFor="expand-all" className="text-sm font-normal">
              Expand folders by default
            </Label>
          </div>
          <Switch
            id="expand-all"
            checked={expandAllByDefault}
            onCheckedChange={(checked) =>
              updateSettings({ expandAllByDefault: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
