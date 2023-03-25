// https://nuxt.com/docs/api/configuration/nuxt-config
export default {
    modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt'],
    runtimeConfig: {
        public: {
            SMART_CONTRACT_ADDRESS: process.env.SMART_CONTRACT_ADDRESS,
        },
    },
}
