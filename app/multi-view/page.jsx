import { MultiViewProvider } from "@/components/multiview/multiview-context";
import { MultiViewWorkspace } from "@/components/multiview/multiview-workspace";
import { APP_NAME } from "@/lib/config";

export const metadata = {
  title: `Multi View - ${APP_NAME}`,
  description: "Watch multiple Kick live streams simultaneously in an adaptive multi-view layout.",
};

export default function MultiViewPage() {
  return (
    <MultiViewProvider>
      <MultiViewWorkspace />
    </MultiViewProvider>
  );
}
