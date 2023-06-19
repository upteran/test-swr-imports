import {
	createStaleWhileRevalidateCache,
	EmitterEvents,
} from 'stale-while-revalidate-cache'

const metrics = {
	countInvocations(_k) {},
	countCacheHit(_k, _v) {},
	countCacheMisses(_k) {},
	countCacheExpirations(_k) {},
	countCacheErrors(_k) {},
	countRevalidationFailures(_k) {},
};

const storage = {
	async getItem(_cacheKey: string) {

	},
	async setItem(_cacheKey: string, _cacheValue: any) {

	},
	async removeItem(_cacheKey: string) {

	},
}

const swr = createStaleWhileRevalidateCache({
	storage, // can be any object with getItem and setItem methods
	minTimeToStale: 5000, // 5 seconds
	maxTimeToLive: 600000, // 10 minutes
	serialize: JSON.stringify, // serialize product object to string
	deserialize: JSON.parse, // deserialize cached product string to object
})

type Payload = {
	cacheKey: string;
	cachedValue: string;
};

swr.onAny((event: EmitterEvents, payload: Payload) => {
	switch (event) {
		case EmitterEvents.invoke:
			metrics.countInvocations(payload.cacheKey)
			break

		case EmitterEvents.cacheHit:
			metrics.countCacheHit(payload.cacheKey, payload.cachedValue)
			break

		case EmitterEvents.cacheMiss:
			metrics.countCacheMisses(payload.cacheKey)
			break

		case EmitterEvents.cacheExpired:
			metrics.countCacheExpirations(payload)
			break

		case EmitterEvents.cacheGetFailed:
		case EmitterEvents.cacheSetFailed:
			metrics.countCacheErrors(payload)
			break

		case EmitterEvents.revalidateFailed:
			metrics.countRevalidationFailures(payload)
			break

		case EmitterEvents.revalidate:
		default:
			break
	}
})

interface Product {
	id: string
	name: string
	description: string
	price: number
}

const req = new Promise((res, _rej) => {
	setTimeout(() => { res('hi product') }, 2000)
})

async function fetchProductDetails(_productId: string): Promise<Product> {
	let product;
	// @ts-ignore
	await req.then(res => product = res);
	return product
}

const productId = 'product-123456'

const result = await swr<Product>(productId, async () =>
	fetchProductDetails(productId)
)

const product = result.value

console.log(product);
