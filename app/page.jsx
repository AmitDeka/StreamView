import { HomeHero } from "@/components/home/hero";
import { MultiViewPreview } from "@/components/home/multiview-preview";
import { HomeFeatures } from "@/components/home/features";
import { HomeCTA } from "@/components/home/cta";

export default function HomePage() {
  return (
    <div className="w-full flex flex-col items-center">
      <HomeHero />
      <MultiViewPreview />
      <HomeFeatures />
      <HomeCTA />
    </div>
  );
}
