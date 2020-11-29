export const getCloudflare = imports => {

	const {
		require: {
			getOS,
			hashify,
			captureError,
			logTestResult
		}
	} = imports

	return new Promise(async resolve => {
		try {
			const api = 'https://www.cloudflare.com/cdn-cgi/trace'
			const res = await fetch(api)
			const text = await res.text()
			const lines = text.match(/^(?:ip|uag|loc|tls)=(.*)$/igm)
			const data = {}
			lines.forEach(line => {
				const key = line.split('=')[0]
				const value = line.substr(line.indexOf('=') + 1)
				data[key] = value
			})
			data.uag = getOS(data.uag)
			const $hash = await hashify(data)
			logTestResult({ test: 'cloudflare', passed: true })
			return resolve({ ...data, $hash })
		}
		catch (error) {
			logTestResult({ test: 'cloudflare', passed: false })
			captureError(error, 'cloudflare.com: failed or client blocked')
			return resolve()
		}
	})
}