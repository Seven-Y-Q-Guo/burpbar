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

import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Icons } from "@/components/ui/icons";

import Hackbar from "./hackbar";

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
      <div className="flex mt-4">
        <Command className="max-w-[200px]">
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="actions">
              <CommandItem>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <span className="flex">
                      import
                      <Icons.importIcon className="ml-1" />
                    </span>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-screen-lg">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Raw text</AlertDialogTitle>
                      <AlertDialogDescription>
                        <Textarea
                          value={rawText}
                          onChange={(e) => {
                            console.log(123);
                            setRawText(e.target.value);
                          }}
                          placeholder={
                            'e.g. curl --location --request GET "https://example.com"'
                          }
                          style={{ height: "300px" }}
                        />
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => {
                          if (rawText) {
                            for (const m of rawText.matchAll(/-H.+?'(.+?)'/g)) {
                              console.log(m[1]);
                            }

                            setValue(rawText.match(/curl '(.+?)'/)[1]);

                            if (rawText.match(/--data-raw.+?'(.+?)'/)[1]) {
                              setBody(rawText.match(/--data-raw.+?'(.+?)'/)[1]);
                              setSelectedOption("POST");
                              setTabValue("Body");
                            }
                          }
                        }}
                      >
                        Continue
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CommandItem>
              <CommandItem>Search Emoji</CommandItem>
              <CommandItem>Calculator</CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Settings">
              <CommandItem>Profile</CommandItem>
              <CommandItem>Billing</CommandItem>
              <CommandItem>Settings</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
        <div className="flex-1">
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
                              parametersClone[index] = [
                                ...parametersClone[index],
                              ];
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
                              parametersClone[index] = [
                                ...parametersClone[index],
                              ];
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
              <Tabs defaultValue="form-data">
                <TabsList>
                  <TabsTrigger value="form-data">form-data</TabsTrigger>
                  <TabsTrigger value="Raw">Raw</TabsTrigger>
                </TabsList>
                <TabsContent value="form-data">
                  <Table className="caption-top">
                    <TableCaption className="text-left my-0 mx-2">
                      form data
                    </TableCaption>
                    <TableBody>
                      {formData.map((item, index) => {
                        return (
                          <TableRow key={item[0]}>
                            <TableCell className="font-medium">
                              <Input
                                placeholder="Key"
                                value={item[0]}
                                onChange={(e) => {
                                  const itemClone = [...formData];
                                  itemClone[index] = [...itemClone[index]];
                                  itemClone[index][0] = e.target.value;

                                  setFormData(itemClone);
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="Value"
                                value={item[1]}
                                onChange={(e) => {
                                  const itemClone = [...formData];
                                  itemClone[index] = [...itemClone[index]];
                                  itemClone[index][1] = e.target.value;

                                  setFormData(itemClone);
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TabsContent>
                <TabsContent value="Raw">
                  <Textarea
                    value={body}
                    onChange={(e) => {
                      setBody(e.target.value);
                    }}
                    style={{ height: "100px" }}
                  />
                </TabsContent>
              </Tabs>
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
        </div>
      </div>
    </>
  );
}

export default App;
