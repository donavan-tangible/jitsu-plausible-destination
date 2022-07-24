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
    if (config.anonymous) {
        context.source_ip = "000.000.000.000"; // masl ip
        context.ids.ga = "undefined"; // mask ga
    }
    //on pageview
    if (eventType === "pageview") {
        context.name = eventType;
        // Add screen resolution
        var regex_firstDigits = /\d*/;
        if (typeof context.screen_resolution !== "undefined") {
            var m = context.screen_resolution.match(regex_firstDigits);
            if (m) {
                context.screen_width = m[0];
            }
        }
        envelops.push({
            url: config.plausible_domain + ":" + config.plausible_port + "/api/event",
            method: "POST",
            headers: {
                "User-Agent": context.user_agent,
                "X-Forwarded-For": context.source_ip,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(context)
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
    const urlEvent = config.plausible_domain + ":" + config.plausible_port + "/api/event";
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
};

exports.descriptor = descriptor;
exports.destination = destination;
exports.validator = validator;

exports.buildInfo = {sdkVersion: "0.7.5", sdkPackage: "jitsu-cli", buildTimestamp: "2022-07-24T14:45:05.420Z"}