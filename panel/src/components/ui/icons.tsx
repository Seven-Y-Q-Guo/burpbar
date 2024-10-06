import play from "../../assets/play.png";
import load from "../../assets/load.png";
import hack from "../../assets/hack.png";

export const Icons = {
  play: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={play} />
  ),
  load: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={load} />
  ),
  hack: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={hack} />
  ),
};
