//require = noderequire

const path = require('path'); //to use path.join and path.relative
const webpack = require('webpack'); //to use webpack plugins
const ExtractTextPlugin = require('extract-text-webpack-plugin');

// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode.
const CheckerPlugin = require('awesome-typescript-loader').CheckerPlugin; //select only checkerplugin from this plugin

const bundleOutputDir = './wwwroot/dist'; //output directory

console.log("__dirname = " +__dirname);
console.log(path.relative(bundleOutputDir, '[resourcePath]'));


//without env like module.export = { } you can't use the env variable inside the function
//env is defined by the caller of webpack, for this application for instance is defined inside .csproj
//<Exec Command="node node_modules/webpack/bin/webpack.js --env.prod" />
module.exports = (env) => {
    const isDevBuild = !(env && env.prod);
    
    return [{
        

        

        stats: { modules: false }, // define which status is showed in console
        entry: { 'main': './ClientApp/boot.tsx' }, //define the first script "the entry point"

        //without pointing out the extensions webpack will not resolve 
        //import statements which not included the extension like './routes' -> './routes.tsx'
        resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx'] }, 

        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: '[name].js',//[name] = entry name
            publicPath: 'dist/'
        },
        module: {
            rules: [
                { test: /\.tsx?$/, include: /ClientApp/, use: 'awesome-typescript-loader?silent=true' },
                { test: /\.css$/, use: isDevBuild ? ['style-loader', 'css-loader'] : ExtractTextPlugin.extract({ use: 'css-loader?minimize' }) },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
            ]
        },
        plugins: [
            new CheckerPlugin(),
            new webpack.DllReferencePlugin({
                context: __dirname,
                manifest: require('./wwwroot/dist/vendor-manifest.json')
            })
        ].concat(isDevBuild ? [
            // Plugins that apply in development builds only
            new webpack.SourceMapDevToolPlugin({
                filename: '[file].map', // Remove this line if you prefer inline source maps
                moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
            })
        ] : [
            // Plugins that apply in production builds only
            new webpack.optimize.UglifyJsPlugin(),
            new ExtractTextPlugin('site.css')
        ])
    }];
};