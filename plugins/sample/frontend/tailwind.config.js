module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    corePlugins: {
        preflight: false, // <--- disables @layer base (the reset)
    },
    plugins: [],
};