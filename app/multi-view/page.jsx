import { MultiViewProvider } from "@/components/multiview/multiview-context";
import { MultiViewWorkspace } from "@/components/multiview/multiview-workspace";

export const metadata = {
  title: "Multi View Workspace - Watch Multiple Kick & YouTube Streams Together",
  description: "Assemble and watch up to 6 Kick live streams and YouTube broadcasts simultaneously in Stage View or Equal Grid. Featuring real-time discovery, custom YouTube URL resolution, instant swap, and audio controls.",
  keywords: [
    "Kick multi view workspace",
    "watch Kick and YouTube together",
    "YouTube live multi view",
    "watch multiple Kick streams",
    "Yatra RP multistream",
    "Kick multistream",
    "multi stream Kick and YouTube",
    "dual stream player",
    "Stage View streaming",
  ],
  alternates: {
    canonical: "/multi-view",
  },
  openGraph: {
    title: "Multi View Workspace - Watch Multiple Kick & YouTube Streams Together",
    description: "Watch up to 6 Kick live streams and YouTube broadcasts simultaneously with Stage View, instant swap, and official embed players.",
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
