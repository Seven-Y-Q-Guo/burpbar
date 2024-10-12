import { useState, useEffect } from "react";

import Hackbar from "./hackbar";
import Postman from "./postman";

import { isValidUrl, isValidFormData } from "./utils";
import "./App.css";

function App() {
  const [value, setValue] = useState("");
  const [body, setBody] = useState("");
  const [postData, setPostData] = useState("");
  const [tabValue, setTabValue] = useState("Parameters");
  const [textareaInfo, setTextareaInfo] = useState({});
  const [selectedOption, setSelectedOption] = useState("GET");
  const [backgroundPageConnection, setBackgroundPageConnection] =
    useState(null);
  const [parameters, setParameters] = useState([]);
  const [formData, setFormData] = useState([]);
  const [rawText, setRawText] = useState("");

  useEffect(() => {
    // no need connection in dev mode
    console.log(import.meta.env.MODE);
    if (import.meta.env.MODE !== "development") {
      setBackgroundPageConnection(
        chrome.runtime.connect({
          name: "burpbar",
        }),
      );
    }
  }, []);

  useEffect(() => {
    if (backgroundPageConnection) {
      backgroundPageConnection.onMessage.addListener(function (message) {
        console.log(message.res, "seven");
        setTextareaInfo(message.res);
      });
    }
  }, [backgroundPageConnection]);

  useEffect(() => {
    if (value && isValidUrl(value)) {
      const url = new URL(value);

      setParameters(url.searchParams);
    }
  }, [value]);

  useEffect(() => {
    if (parameters.length && isValidUrl(value)) {
      const url = new URL(value);

      setValue(
        url.origin +
          url.pathname +
          "?" +
          parameters
            .map((parameter) => `${parameter[0]}=${parameter[1]}`)
            .join("&"),
      );
    }
  }, [parameters, value]);

  useEffect(() => {
    if (!postData) {
      setFormData([]);
    }
    if (isValidFormData(postData)) {
      setBody(
        JSON.stringify(
          postData.split("&").reduce(
            (a, c) => ({
              ...a,
              [c.split("=")[0]]: c.split("=")[1],
            }),
            {},
          ),
          null,
          2,
        ),
      );
      setFormData(
        postData
          .split("&")
          .map((item) => [item.split("=")[0], item.split("=")[1]]),
      );
    }
  }, [postData]);

  useEffect(() => {
    setPostData(formData.map((item) => `${item[0]}=${item[1]}`).join("&"));
  }, [formData]);

  useEffect(() => {
    if (selectedOption === "GET") {
      setPostData("");
    }
  }, [selectedOption]);

  return (
    <>
      <Hackbar
        value={value}
        setValue={setValue}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        postData={postData}
        setPostData={setPostData}
      />
      <Postman
        rawText={rawText}
        setRawText={setRawText}
        value={value}
        setValue={setValue}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        tabValue={tabValue}
        setTabValue={setTabValue}
        parameters={parameters}
        setParameters={setParameters}
        formData={formData}
        setFormData={setFormData}
        body={body}
        setBody={setBody}
        textareaInfo={textareaInfo}
        setTextareaInfo={setTextareaInfo}
        backgroundPageConnection={backgroundPageConnection}
      />
    </>
  );
}

export default App;
