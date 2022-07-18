import {DefaultJitsuEvent} from "@jitsu/types/event";
import {DestinationFunction, DestinationMessage, JitsuDestinationContext} from "@jitsu/types/extension";
import {flatten, removeProps} from "@jitsu/pipeline-helpers";

export type PlausibleDestinationConfig = {
    anonymous?: boolean,
    plausible_domain: string,
    plausible_port: string
}

export const JitsuPlausible: DestinationFunction<DefaultJitsuEvent, PlausibleDestinationConfig> =  (event: DefaultJitsuEvent, dstContext: JitsuDestinationContext<PlausibleDestinationConfig>) => {
    const context = event.eventn_ctx || event;
    const user = context.user || {};
    const utm = context.utm || {};
    const location = context.location || {};
    const ua = context.parsed_ua || {};
    const conversion = context.conversion || {};

    const matches = context.referer?.match(
        /^http?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i
    );
    const refDomain = matches && matches[1]; // domain will be null if no match is found
    const config = dstContext.config

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
    let envelops:DestinationMessage[] = [];

    //on pageview
    if (eventType === "pageview") {
      envelops.push({
        url: "http://"+config.plausible_domain+":"+config.plausible_port+"/api/event"+ JSON.stringify(context),
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
}
