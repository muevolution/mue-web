import * as formatter from "string-format";

export function format(message: string, args: {[key: string]: string}) {
    const transformers = {
        "name": (str: string) => {
            return `<a href=\"#\" onclick="alert('${encodeURI(str)}')">${encodeURI(args[`__hyper_name_${str}`])}</a>`;
        }
    };

    const f = formatter.create(transformers);
    return f(message, args);
}
