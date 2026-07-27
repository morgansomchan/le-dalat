import SmoothScroll from "@/components/SmoothScroll";
import SceneOpening from "@/components/home/SceneOpening";
import SceneHouseRemembers from "@/components/home/SceneHouseRemembers";
import SceneSignatureDishes from "@/components/home/SceneSignatureDishes";
import ScenePeople from "@/components/home/ScenePeople";
import SceneNightGarden from "@/components/home/SceneNightGarden";

/**
 * Homepage — the scroll narrative (design_brief.md §3), all six scenes.
 * The journey of color: navy (1–2) → melt to brown (3) → dive to royal
 * blue (4, the house linen) → back through brown (5) → darkest brown
 * finale (6). Each scene opens on the ground the previous one ends on.
 * The page ends at the reservation handoff — nothing after the invitation.
 */
export default function Home() {
  return (
    <main>
      <SmoothScroll />
      <SceneOpening />
      <SceneHouseRemembers />
      <SceneSignatureDishes />
      <ScenePeople />
      <SceneNightGarden />
    </main>
  );
}
