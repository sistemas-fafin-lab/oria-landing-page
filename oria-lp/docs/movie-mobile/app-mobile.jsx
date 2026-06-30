/* ORIA brand film — composição 4:5 (1080×1350). Carrega por último. */

const DUR_M = 32;

function SeekerM() {
  const { setTime, setPlaying } = useTimeline();
  React.useEffect(() => {
    window.__seek = (t) => { setPlaying(false); setTime(t); };
    return () => { delete window.__seek; };
  }, [setTime, setPlaying]);
  return null;
}

function FilmM() {
  return (
    <Stage width={1080} height={1350} duration={DUR_M} fps={60}
      background="linear-gradient(178deg, #0e1513 0%, #111715 44%, #0b1712 100%)"
      persistKey="oria-film-m">
      <BackdropM />
      <SeekerM />
      <div data-screen-label="4:5" style={{ position: "absolute", inset: 0 }}>
        <Sprite start={0}     end={4.2}>  <SceneOpenM /></Sprite>
        <Sprite start={4.2}   end={9.4}>  <SceneProblemM /></Sprite>
        <Sprite start={9.4}   end={14.6}> <SceneSendM /></Sprite>
        <Sprite start={14.6}  end={19.0}> <SceneProcessM /></Sprite>
        <Sprite start={19.0}  end={25.0}> <SceneReceiveM /></Sprite>
        <Sprite start={25.0}  end={32.0}> <SceneCloseM /></Sprite>
        <JourneyTrackerM />
      </div>
    </Stage>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.Fragment>
    <FilmM />
    <ExportPanel duration={DUR_M} width={1080} height={1350}
      seek={(t) => window.__seek && window.__seek(t)} fileBase="oria-filme-4x5" />
  </React.Fragment>
);
