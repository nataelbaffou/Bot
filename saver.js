import WebSocket from 'ws';
import fs from 'fs';
import fetch from 'node-fetch';

const accessToken = "64865847-oTqvjJZKu_aO0mDu1aVcbXPMvRpWNg";
const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws', {
    headers: {
        "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
        "Origin": "https://hot-potato.reddit.com"
    }
});

ws.onopen = () => {
    ws.send(JSON.stringify({
        'type': 'connection_init',
        'payload': {
            'Authorization': `Bearer ${accessToken}`
        }
    }));

    ws.send(JSON.stringify({
        "id": "1",
        "type": "start",
        "payload": {
            "variables": {
                "input": {
                    "channel": {
                        "teamOwner": "AFD2022",
                        "category": "CONFIG"
                    }
                }
            },
            "extensions": {},
            "operationName": "configuration",
            "query": "subscription configuration($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on ConfigurationMessageData {\n          colorPalette {\n            colors {\n              hex\n              index\n              __typename\n            }\n            __typename\n          }\n          canvasConfigurations {\n            index\n            dx\n            dy\n            __typename\n          }\n          canvasWidth\n          canvasHeight\n          __typename\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        }
    }));

    ws.send(JSON.stringify({
        "id": "3",
        "type": "start",
        "payload": {
            "variables": {
                "input": {
                    "channel": {
                        "teamOwner": "AFD2022",
                        "category": "CANVAS",
                        "tag": "1"
                    }
                }
            },
            "extensions": {},
            "operationName": "replace",
            "query": "subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n        ... on DiffFrameMessageData {\n          __typename\n          name\n          currentTimestamp\n          previousTimestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}\n"
        }
    }));
};

ws.onmessage = (message) => {
    const {
        data
    } = message;
    const parsed = JSON.parse(data);
    if (parsed.payload && parsed.payload.data && parsed.payload.data.subscribe.data && parsed.payload.data.subscribe.data.name) {
        const url = parsed.payload.data.subscribe.data.name
        const fStream = fs.createWriteStream(`E:\\frames\\${parsed.payload.data.subscribe.data.currentTimestamp}.png`);
        fetch(url)
            .then(res => res.body.pipe(fStream))
            .then(() => {
                console.log(`${parsed.payload.data.subscribe.data.currentTimestamp} saved`);
            }
            );
    }
}