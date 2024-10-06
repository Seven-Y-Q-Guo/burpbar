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
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";

import { isValidUrl } from "./utils";
import "./App.css";

function App() {
  const [value, setValue] = useState("");
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
                  let code =
                    '{const url = "' + encodeURIComponent(value) + '";';
                  code += "window.location.href = decodeURIComponent(url);}";

                  chrome.devtools.inspectedWindow.eval(
                    code,
                    function (result, isException) {
                      console.log(result, isException);
                    },
                  );
                }
              }}
            >
              <Icons.play />
              Execute
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
      <Tabs defaultValue="Parameters" className="mt-2.5">
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
        <TabsContent value="Body">Body</TabsContent>
        <TabsContent value="Headers">Headers</TabsContent>
      </Tabs>
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
