export function postJSON(url: string, payload: any, authToken: string | undefined): Promise<any> {
	return jsonRequestPromise(url, "POST", payload, authToken);
}

export function getJSON(url: string, authToken: string | undefined): Promise<any> {
	return jsonRequestPromise(url, "GET", undefined, authToken);
}

export function jsonRequestPromise(url: string, method: string, payload: object | undefined, authToken: string | undefined): Promise<[number, string]> {
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest();
		if (authToken) {
			if (!url.includes("?")) url += "?";
			url += "&jwt=" + authToken;
		}
		xhr.open(method, url, true);
		if (payload) {
			const payloadString = JSON.stringify(payload);
			xhr.send(payloadString);
		} else {
			xhr.send();
		}
		xhr.onerror = () => {
			throw Object({ "respCode": 0, "msg": "Could not connect to server!" });
		};
		xhr.onreadystatechange = () => {
			if (xhr.readyState === 4) {
				if (xhr.status === 401) {
					window.location.href = "/login?source=" + encodeURIComponent(window.location.href);
				}
				if (xhr.status === 403) {
					window.location.href = "/";
				}
				if (xhr.status === 302) {
					window.location.href = xhr.responseText;
				}
				if (xhr.status === 200) {
					// xhr finished successfully
					const resp = xhr.responseText;
					const respJson = JSON.parse(resp);
					resolve(respJson);
				} else {
					// xhr failed
					reject(Object({ "respCode": xhr.status, "msg": xhr.responseText }));
				}
			}
		};
	});
}
