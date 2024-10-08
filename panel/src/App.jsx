import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/ui/icons";

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
    if (isValidFormData(postData)) {
      setBody(postData);
    }
  }, [postData]);

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem value="item-1">
          <AccordionTrigger className="justify-start">
            <Icons.hack />
            hackbar
          </AccordionTrigger>
          <AccordionContent>
            <Button
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => {
                if (import.meta.env.MODE !== "development") {
                  chrome.devtools.inspectedWindow.eval(
                    "location.href",
                    (response) => {
                      setValue(response);
                    },
                  );
                }
              }}
            >
              <Icons.load />
              Load URL
            </Button>
            <Button
              disabled={isValidUrl(value) ? false : true}
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => {
                if (import.meta.env.MODE !== "development") {
                  if (selectedOption === "GET") {
                    let code =
                      '{const url = "' + encodeURIComponent(value) + '";';
                    code += "window.location.href = decodeURIComponent(url);}";

                    chrome.devtools.inspectedWindow.eval(
                      code,
                      function (result, isException) {
                        console.log(result, isException);
                      },
                    );
                  } else {
                    let fields = Array();
                    let f_split = postData.trim().split("&");
                    for (let i in f_split) {
                      let f = f_split[i].match(/(^.*?)=(.*)/);
                      if (f.length === 3) {
                        let item = {};
                        item["name"] = f[1];
                        item["value"] = unescape(f[2]);
                        fields.push(item);
                      }
                    }
                    let code =
                      '{var post_data = "' +
                      encodeURIComponent(JSON.stringify(fields)) +
                      '"; var url = "' +
                      encodeURIComponent(value) +
                      '";';
                    code +=
                      "var fields = JSON.parse(decodeURIComponent(post_data));";
                    code += 'const form = document.createElement("form");';
                    code += 'form.setAttribute("method", "post");';
                    code +=
                      'form.setAttribute("action", decodeURIComponent(url));';
                    code +=
                      'fields.forEach(function(f) { var input = document.createElement("input"); input.setAttribute("type", "hidden"); input.setAttribute("name", f[\'name\']); input.setAttribute("value", f[\'value\']); form.appendChild(input); });';
                    code += "document.body.appendChild(form);";
                    code += "form.submit();}";
                    chrome.devtools.inspectedWindow.eval(
                      code,
                      function (result, isException) {
                        console.log(result, isException);
                      },
                    );
                  }
                }
              }}
            >
              <Icons.play />
              Execute
            </Button>
            <Button
              disabled={isValidUrl(value) ? false : true}
              className="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
              onClick={() => {
                if (import.meta.env.MODE !== "development") {
                  let result = value.replace(new RegExp(/&/g), "\n&");
                  result = result.replace(new RegExp(/\?/g), "\n?");

                  setValue(result);
                }
              }}
            >
              <Icons.split />
              Split URL
            </Button>
            <Textarea
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
              }}
              style={{ height: "100px" }}
              className={
                "mt-2.5 " +
                (value &&
                  (isValidUrl(value) ? "border-green-500" : "border-red-500"))
              }
            />
            {value && !isValidUrl(value) && (
              <Label className="text-red-500 mt-1 inline-block">
                The URL you input is not correct, please try again.
              </Label>
            )}
            {selectedOption === "POST" && (
              <Textarea
                placeholder="key1=value1&key2=value2"
                value={postData}
                onChange={(e) => {
                  setPostData(e.target.value);
                }}
                style={{ height: "100px" }}
                className={
                  "mt-2.5 " +
                  (postData &&
                    (isValidFormData(postData)
                      ? "border-green-500"
                      : "border-red-500"))
                }
              />
            )}
            {postData && !isValidFormData(postData) && (
              <Label className="text-red-500 mt-1 inline-block">
                The post data you input is not correct, please try again.
              </Label>
            )}
            <div className="flex items-center mt-4">
              <Checkbox
                checked={selectedOption === "POST" ? true : false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedOption("POST");
                    setTabValue("Body");
                  } else {
                    setSelectedOption("GET");
                    setTabValue("Parameters");
                  }
                }}
                className="mr-2"
                id="postData"
              />
              <label
                htmlFor="postData"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-4"
              >
                Post data
              </label>
              <Checkbox className="mr-2" id="referer" />
              <label
                htmlFor="referer"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-4"
              >
                Referer
              </label>
              <Checkbox className="mr-2" id="userAgent" />
              <label
                htmlFor="userAgent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-4"
              >
                User Agent
              </label>
              <Checkbox className="mr-2" id="cookies" />
              <label
                htmlFor="cookies"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mr-4"
              >
                Cookies
              </label>
              <a
                readOnly
                href="#"
                className="inline-flex items-center font-medium text-blue-600 dark:text-blue-500 hover:underline"
                onClick={() => {
                  setValue("");
                  // console.log(123);
                }}
              >
                Clear All
                <Icons.clear className="ml-1" />
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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
            console.log(import.meta.env.MODE);
            if (import.meta.env.MODE !== "development") {
              backgroundPageConnection.postMessage({
                name: "request",
                data: {
                  url: value,
                  method: selectedOption,
                },
              });
            }
          }}
        >
          Send
        </Button>
      </div>
      <Tabs
        value={tabValue}
        onValueChange={(val) => {
          setTabValue(val);
        }}
        className="mt-2.5"
      >
        <TabsList>
          <TabsTrigger value="Parameters">Parameters</TabsTrigger>
          <TabsTrigger value="Body">Body</TabsTrigger>
          <TabsTrigger value="Headers">Headers</TabsTrigger>
        </TabsList>
        <TabsContent value="Parameters">
          <Table className="caption-top">
            <TableCaption className="text-left my-0 mx-2">
              Query Parameters
            </TableCaption>
            <TableBody>
              {[...parameters].map((parameter, index) => {
                return (
                  <TableRow key={parameter[0]}>
                    <TableCell className="font-medium">
                      <Input
                        placeholder="Key"
                        value={parameter[0]}
                        onChange={(e) => {
                          const parametersClone = [...parameters];
                          parametersClone[index] = [...parametersClone[index]];
                          parametersClone[index][0] = e.target.value;

                          setParameters(parametersClone);
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        placeholder="Value"
                        value={parameter[1]}
                        onChange={(e) => {
                          const parametersClone = [...parameters];
                          parametersClone[index] = [...parametersClone[index]];
                          parametersClone[index][1] = e.target.value;

                          setParameters(parametersClone);
                        }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="Body">
          <Table className="caption-top">
            <TableCaption className="text-left my-0 mx-2">
              Raw Request Body
            </TableCaption>
            <TableBody>
              <Textarea
                value={body}
                onChange={(e) => {
                  setBody(e.target.value);
                }}
                style={{ height: "100px" }}
              />
            </TableBody>
          </Table>
        </TabsContent>
        <TabsContent value="Headers">Headers</TabsContent>
      </Tabs>
      <Separator className="my-2" />
      {textareaInfo.content && (
        <span className="flex items-center text-sm font-medium text-gray-900 dark:text-white me-3">
          <span className="flex w-2.5 h-2.5 bg-teal-500 rounded-full me-1.5 flex-shrink-0"></span>
          <span>Status: {textareaInfo.status}</span>
          <span className="mx-2">Size: {textareaInfo.contentLength} B</span>
        </span>
      )}
      <Textarea
        value={textareaInfo.content}
        readOnly
        style={{ height: "500px" }}
      />
    </>
  );
}

export default App;
