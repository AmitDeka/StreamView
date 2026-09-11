import { MultiViewProvider } from "@/components/multiview/multiview-context";
import { MultiViewWorkspace } from "@/components/multiview/multiview-workspace";
import { APP_NAME } from "@/lib/config";

export const metadata = {
  title: "Multi View Workspace - Watch Multiple Kick Streams Together",
  description: "Assemble and watch up to 6 Kick live streams simultaneously in Stage View or Equal Grid. Featuring real-time Yatra RP discovery, instant swap, and audio controls.",
  keywords: [
    "Kick multi view workspace",
    "watch multiple Kick streams",
    "Yatra RP multistream",
    "Kick multistream",
    "multi stream Kick",
    "Kick live cockpit",
    "Stage View Kick",
  ],
  alternates: {
    canonical: "/multi-view",
  },
  openGraph: {
    title: "Multi View Workspace - Watch Multiple Kick Streams Together",
    description: "Watch up to 6 Kick live streams simultaneously with Stage View, instant swap, and official Kick embed players.",
    url: "/multi-view",
    type: "website",
  },
};

export default function MultiViewPage() {
  return (
    <MultiViewProvider>
      <MultiViewWorkspace />
    </MultiViewProvider>
  );
}
