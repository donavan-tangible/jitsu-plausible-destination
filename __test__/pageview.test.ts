import {destination} from "../src";
import {JitsuDestinationContext} from "@jitsu/types/extension";
import {testDestination} from "jitsu-cli/lib/tests";
import {PlausibleDestinationConfig} from "../src/plausible-destination";

/**
 * Represents context data of configured destination instance
 */
const testContext: JitsuDestinationContext<PlausibleDestinationConfig> = {
    destinationId: "abc123",
    destinationType: "plausible",
    config: {
        anonymous: true,
        plausible_domain: "http://plausible.tangible.one",
        plausible_port: "8000"
    }
}

const date = new Date()
const isoDate = date.toISOString()
const epoch = date.getTime()

testDestination({
        name: "pageview",
        context: testContext,
        destination: destination,
        event: {
            event_type: "pageview",
            name: "pageview",
            domain: testContext.config.plausible_domain,
            url: testContext.config.plausible_domain+":"+testContext.config.plausible_port+"/Jitsu-TestDestination"
        },
        expectedResult: [
            {
                "body": JSON.stringify(
                    {
                        name: "pageview",
                        url: testContext.config.plausible_domain+":"+testContext.config.plausible_port+"/Jitsu-TestDestination",
                        domain: testContext.config.plausible_domain
                    }
                ),
                "headers": {
                    "Content-Type": "application/json",
                },
                "method": "POST",
                "url": testContext.config.plausible_domain+":"+testContext.config.plausible_port+"/api/event"
            }
        ]
    }
)
