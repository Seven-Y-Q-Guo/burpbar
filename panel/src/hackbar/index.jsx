import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/ui/icons";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { isValidUrl, isValidFormData } from "../utils";

function Hackbar({
  value,
  setValue,
  selectedOption,
  setSelectedOption,
  postData,
  setPostData,
  setTabValue,
}) {
  return (
    <div>
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
    </div>
  );
}

export default Hackbar;
