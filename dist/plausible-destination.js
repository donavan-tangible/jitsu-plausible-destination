'use strict';

Object.defineProperties(exports, { __esModule: { value: true }, [Symbol.toStringTag]: { value: 'Module' } });

const JitsuPlausible = (event, dstContext) => {
    const context = event.eventn_ctx || event;
    context.user || {};
    context.utm || {};
    context.location || {};
    context.parsed_ua || {};
    context.conversion || {};
    const matches = context.referer?.match(/^http?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
    matches && matches[1]; // domain will be null if no match is found
    const config = dstContext.config;
    function getEventType($) {
        switch ($.event_type) {
            case "pageview":
                return "pageview";
            //case "user_identify":
            //case "identify":
            //    return "$identify";
            //case "page":
            //case "site_page":
            //    return "site_page";
            default:
                return $.event_type;
        }
    }
    const eventType = getEventType(event);
    let envelops = [];
    //on pageview
    if (eventType === "pageview") {
        envelops.push({
            url: "http://" + config.plausible_domain + ":" + config.plausible_port + "/api/event" + JSON.stringify(context),
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": eventType,
                "url": event.url,
                "domain": event.domain
            })
        });
    }
    return envelops;
};

const destination = JitsuPlausible;
const validator = async (config) => {
    ['plausible_domain', 'plausible_port'].forEach(prop => {
        if (config[prop] === undefined) {
            throw new Error(`Required property '${prop}' is absent in config. Present props: ${Object.keys(config)}`);
        }
    });
    const urlEvent = "http://" + config.plausible_domain + ":" + config.plausible_port + "/api/event";
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
            return { ok: true };
        }
        else {
            return { ok: false, message: `Response status:${res.status} from url:${urlEvent}` };
        }
    }
    else {
        return { ok: false, message: `Error Code: ${res.status} msg: ${await res.text()}` };
    }
};
const descriptor = {
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
            displayName: "Plausible server domain",
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
};

exports.descriptor = descriptor;
exports.destination = destination;
exports.validator = validator;

exports.buildInfo = {sdkVersion: "0.7.5", sdkPackage: "jitsu-cli", buildTimestamp: "2022-07-18T13:33:16.382Z"}