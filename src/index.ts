import {JitsuPlausible, PlausibleDestinationConfig} from "./plausible-destination";
import {ConfigValidator, DestinationFunction, ExtensionDescriptor} from "@jitsu/types/extension";

const destination: DestinationFunction = JitsuPlausible

const validator: ConfigValidator<PlausibleDestinationConfig> = async (config) => {
    ['plausible_domain', 'plausible_port'].forEach(prop => {
        if (config[prop] === undefined) {
            throw new Error(`Required property '${prop}' is absent in config. Present props: ${Object.keys(config)}`);
        }
    })
    const urlEvent = config.plausible_domain + ":" +config.plausible_port + "/api/event";
    let res = await fetch(urlEvent, {
        method: 'post',
        body: JSON.stringify({
            name: "test",
            domain: "test",
            url: "http://dummy.site"
        })
    });

    if (res.headers?.get('Content-Type') === "text/plain; charset=utf-8") {
        if (res.status === 202) {
            return {ok: true}
        } else {
            return {ok: false, message: `Response status:${res.status} from url:${urlEvent}`}
        }
    } else {
        return {ok: false, message: `Error Code: ${res.status} msg: ${await res.text()}`}
    }
}

const descriptor: ExtensionDescriptor<PlausibleDestinationConfig> = {
    id: "jitsu-plausible-destination",
    displayName: "plausible",
    icon: "",
    description: "Jitsu can send events from JS SDK or Events API to Plausible API filling as much Plausible Events " +
        "Properties as possible from original event data.",
    configurationParameters: [
        {
            id: "anonymous",
            type: "boolean",
            required: false,
            displayName: "Send anonymous data",
            documentation: "Send anonymous data to Plausbile if true or all data including user data if false.",
        },
        {
            id: "plausible_domain",
            type: "string",
            required: true,
            displayName: "Plausible server domain including protocol (http(s)://<domain>)",
            documentation: "Url domain",
        },
        {
            id: "plausible_port",
            type: "string",
            required: true,
            displayName: "Plausible server port",
            documentation: "Url port",
        }
    ],
}

export {descriptor, destination, validator}
