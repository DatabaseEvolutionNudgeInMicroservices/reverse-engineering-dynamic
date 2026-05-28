# DENIM Reverse Engineering Dynamic Analysis

## Installation

### Prerequisites

1. [NodeJS](https://nodejs.org/en) (tested in version v18.20.7)
2. [NodeProf](https://github.com/Haiyang-Sun/nodeprof.js)

### Setup

The JavaScript dynamic analysis is done using [NodeProf](https://github.com/Haiyang-Sun/nodeprof.js/), a
dynamic analysis framework for NodeJS [4]. Please refer to their repository for installation instructions.
**NOTE**: despite this library is made for Windows and Unix (Linux/macOS), this was only tested on macOS.

1. Create a `lib` folder in project root.
2. **Include your NodeProf workspace in the `lib` directory**, as explained on their [repository](https://github.com/Haiyang-Sun/nodeprof.js/). The module should include the `./lib/workspace-nodeprof` directory.
