import Hero from "../components/Hero";
import BranchPreview from "../components/BranchPreview";
import ComingSoon from "../components/ComingSoon";

export default function Home({ activeTab, onChangeTab }) {
  return (
    <>
      <Hero activeTab={activeTab} onChangeTab={onChangeTab} />
      <BranchPreview onExploreBranches={() => onChangeTab("branches")} />
      {/* <ComingSoon />*/}
    </>
  );
}
