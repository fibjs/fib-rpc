const vm = require('vm')

;[
    [{ ENTRY: '../lib/index.js',      }],
    [{ ENTRY: '../dist/index.js',     }],
    [{ ENTRY: '../dist/index.min.js', }],
].forEach(([envs]) => {
    const vbox = new vm.SandBox({}, name => require(name))

    const entry = envs.ENTRY
    
    let abspath = null
    try {
        abspath = require.resolve(entry, __dirname)
    } catch (error) {
        return ;
    }

    vbox.add({
        [`${require.resolve('..')}`]: require(abspath),
        [`${require.resolve('../lib')}`]: require(abspath),
    })
    
    vbox.run(require.resolve('./index'))
})

process.exit();