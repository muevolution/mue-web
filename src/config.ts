interface ConfigFormat {
    target_url: string;
}

// TODO: Pull this in, somehow
function loadConfig(): ConfigFormat {
    return {
        "target_url": "http://localhost:3000"
    };
}

const configEnv = loadConfig();

export const config = {
    "target_url": configEnv.target_url
};
