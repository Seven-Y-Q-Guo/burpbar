import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./App.css";

function App() {
  const [value, setValue] = useState("");
  const [selectedOption, setSelectedOption] = useState("GET");

  return (
    <div className="flex">
      <Select
        value={selectedOption}
        onValueChange={(value) => {
          setSelectedOption(value);
        }}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="GET">GET</SelectItem>
          <SelectItem value="POST">POST</SelectItem>
          <SelectItem value="PUT">PUT</SelectItem>
          <SelectItem value="DELETE">DELETE</SelectItem>
        </SelectContent>
      </Select>
      <Input
        placeholder="Enter a URL"
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
      <Button
        onClick={() => {
          var backgroundPageConnection = chrome.runtime.connect({
            name: "burpbar",
          });
          console.log(selectedOption);
          backgroundPageConnection.postMessage({
            name: "request",
            data: {
              url: value,
              method: selectedOption,
            },
          });
        }}
      >
        Send
      </Button>
    </div>
  );
}

export default App;
