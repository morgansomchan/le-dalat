import SmoothScroll from "@/components/SmoothScroll";
import HomeSiteHeader from "@/components/home/HomeSiteHeader";
import SceneOpening from "@/components/home/SceneOpening";
import SceneHouseRemembers from "@/components/home/SceneHouseRemembers";
import SceneSignatureDishes from "@/components/home/SceneSignatureDishes";
import ScenePeople from "@/components/home/ScenePeople";
import SceneNightGarden from "@/components/home/SceneNightGarden";

/**
 * Homepage — the scroll narrative (design_brief.md §3), all six scenes.
 * The journey of color: navy (1–2) → midnight jade (3) → one ground per
 * dish (4: amber → basil → ember → royal) → royal warming through brown
 * (5) → the lit table (6). Each scene opens on the ground the previous
 * one ends on.
 * The page ends at the reservation handoff — nothing after the invitation.
 */
export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <HomeSiteHeader />
      <SceneOpening />
      <div className="home-story-canvas">
        <SceneHouseRemembers />
        <SceneSignatureDishes />
        <ScenePeople />
        <SceneNightGarden />
      </div>
    </main>
  );
}
