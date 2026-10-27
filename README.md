# RCRC — 遙控車原理實驗室

A Traditional Chinese / Cantonese interactive educational explorer for a generic 1:10 electric crawler inspired by the user's Vanquish and Land Cruiser project direction.

## Experience

- Three.js procedural 3D with 653 individually attributed meshes across 13 component categories.
- Orbit, zoom, front/side/top/underside camera presets and full-screen viewport.
- Component and system selection keeps relevant components coloured and fades the rest.
- Body hidden, translucent or solid.
- Pistol transmitter steering wheel drag, steering and throttle sliders, momentary forward/reverse controls, stop and 11-second demonstration.
- Driven wheels, transmission gears, shafts, servo horn, steering linkages, and suspension articulation.
- Keyboard accessible controls, mobile layout and graceful WebGL failure state.

## Model scope

This is an explanatory model, not manufacturer CAD or a purchasing/assembly specification. It uses generic straight locked axles, equal front/rear drive speed, a separate brushed motor/ESC, and a servo mounted on the axle. Portal gearing, DIG, selectable overdrive, tire/terrain physics and FPV are intentionally outside this introductory model. Geometry and gear speeds are schematic.

Primary references are linked in the on-page model notes. Three.js modules are vendored locally with their MIT license.

## Development

Buildless static app in `dist/`. GitHub repository: `stevebillybt-orph/RCRC`. Vercel project name: `rcrc`.

Vercel settings are declared in `vercel.json`: no framework, no install or build command, and `dist` as the output directory. Once connected to GitHub, pushes to the production branch deploy automatically. All Three.js dependencies are vendored locally; no CDN or package install is required.

## Validation

- JavaScript syntax check passed.
- Source-level Three.js geometry/interaction harness verified all 13 material selections, front-only steering, four-wheel forward/reverse rotation, stopping, suspension compression/extension and finite geometry vertices.
- Independent geometric projections inspected for the chassis and body.
- Browser UI verified component explanations, sliders, stop, centering and suspension toggle.
- The managed QA browser has WebGL disabled. GPU-rendered orbit/raycast visuals and mobile touch gestures could not be end-to-end verified there. The app displays a clear compatibility message and retains learning content if WebGL is unavailable.
