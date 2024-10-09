import play from "../../assets/play.png";
import load from "../../assets/load.png";
import hack from "../../assets/hack.png";
import split from "../../assets/split.png";
import clear from "../../assets/clear.png";
import importIcon from "../../assets/import.png";

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
  split: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={split} />
  ),
  clear: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={clear} />
  ),
  importIcon: (props) => (
    <img className={"w-6 mr-1 " + (props.className || "")} src={importIcon} />
  ),
};
