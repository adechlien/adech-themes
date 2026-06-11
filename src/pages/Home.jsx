import Hero from "../components/Hero";
import BranchPreview from "../components/BranchPreview";

export default function Home({ activeTab, onChangeTab }) {
  return (
    <div className="flex flex-col gap-40">
      <Hero activeTab={activeTab} onChangeTab={onChangeTab} />
      <BranchPreview onExploreBranches={() => onChangeTab("branches")} />
    </div>
  );
}
