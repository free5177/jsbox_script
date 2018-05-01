const proxyUtil = require('scripts/proxyUitl')
const su = require('scripts/sizeUtil')
const cu = require('scripts/colorUtil')
const FILE = 'data.js'

if (!$file.exists(FILE)) {
    $file.write({
        data: $data({ "string": JSON.stringify({ "urls": [] }) }),
        path: FILE
    })
}

const screenHeight = $device.info.screen.height
const screenWidth = $device.info.screen.width

const selectedColor = $color("#d1e0e0")
const defaultColor = $color("#ffffff")

function renderUI() {
    $ui.render({
        props: {
            title: "Surge规则"
        },
        views: [{
            type: "scroll",
            props: {
                id: "mainView"
            },
            layout: $layout.fill,
            views: [{
                type: "input",
                props: {
                    id: "fileName",
                    text: '',
                    placeholder: "配置名（lhie1)"
                },
                layout: (make, view) => {
                    make.width.equalTo(screenWidth / 2 - 15)
                    // make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.left.top.equalTo(10)
                },
                events: {
                    returned: sender => {
                        $("fileName").blur()
                        saveWorkspace()
                    }
                }
            }, {
                type: "button",
                props: {
                    id: "serverURL",
                    title: "导入节点"
                },
                layout: (make, view) => {
                    make.width.equalTo(screenWidth / 2 - 15)
                    // make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    // make.top.equalTo($("fileName").bottom).offset(10)
                    make.left.equalTo($("fileName").right).offset(10)
                    make.top.right.equalTo(10)
                },
                events: {
                    tapped: sender => {
                        importMenu({
                            handler: res => {
                                if (!res) {
                                    $ui.alert("没有检测到节点信息")
                                }
                                let listData = $("serverEditor").data || []
                                for (let idx in res) {
                                    listData.push({
                                        proxyName: { text: res[idx].split('=')[0].trim(), bgcolor: defaultColor },
                                        proxyLink: res[idx]
                                    })
                                }
                                $("serverEditor").data = listData
                                saveWorkspace()
                            }
                        })
                    }
                }
            }, {
                type: "matrix",
                props: {
                    id: "serverControl",
                    columns: 3,
                    // radius: 5,
                    itemHeight: 40,
                    bgcolor: $color("#f0f5f5"),
                    data: [{
                        title: { text: '倒序' }
                    }, {
                        title: { text: '全部Auto' }
                    }, {
                        title: { text: '清空' }
                    }],
                    template: [{
                        type: "label",
                        props: {
                            id: "title",
                            align: $align.center
                        },
                        layout: $layout.fill
                    }]
                },
                layout: (make, view) => {
                    make.width.equalTo(view.super).offset(-20)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(40)
                    make.top.equalTo($("serverURL").bottom).offset(10)
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        if (indexPath.item == 0) {
                            let rd = $("serverEditor").data.reverse()
                            $("serverEditor").data = rd
                        } else if (indexPath.item == 1) {
                            let data = $("serverEditor").data.map(i => {
                                i.proxyName.bgcolor = selectedColor
                                return i
                            })
                            $("serverEditor").data = data
                        } else if (indexPath.item == 2) {
                            $("serverEditor").data = []
                        }
                        saveWorkspace()
                    }
                }
            }, {
                type: "list",
                props: {
                    id: "serverEditor",
                    data: [],
                    actions: [{
                        title: "delete",
                        handler: (sender, indexPath) => {
                            saveWorkspace()
                        }
                    }],
                    borderWidth: 1,
                    borderColor: $color("#f0f5f5"),
                    template: {
                        views: [{
                            type: 'label',
                            props: {
                                id: 'proxyName',
                                align: $align.center,
                                autoFontSize: true
                            },
                            layout: $layout.fill
                        }]
                    },
                    // radius: 5
                },
                layout: (make, view) => {
                    make.width.equalTo(view.super).offset(-20)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(screenHeight - 340)
                    make.top.equalTo($("serverControl").bottom)
                },
                events: {
                    didSelect: (sender, indexPath, data) => {
                        let proxyName = data.proxyName.text
                        data.proxyName.bgcolor = cu.isEqual(data.proxyName.bgcolor, selectedColor) ? defaultColor : selectedColor
                        let uiData = $("serverEditor").data
                        uiData[indexPath.row] = data
                        $("serverEditor").data = uiData
                        saveWorkspace()
                    }
                }
            }, {
                type: "switch",
                props: {
                    id: "adsSwitch"
                },
                layout: (make, view) => {
                    make.width.equalTo(40)
                    make.height.equalTo(35)
                    make.top.equalTo($("serverEditor").bottom).offset(10)
                    make.right.equalTo($("serverEditor").right).offset(-10)
                },
                events: {
                    changed: sender => {
                        saveWorkspace()
                    }
                }
            }, {
                type: "label",
                props: {
                    text: "去广告规则",
                },
                layout: (make, view) => {
                    make.width.equalTo(200)
                    make.height.equalTo(35)
                    make.left.equalTo(10)
                    make.top.equalTo($("serverEditor").bottom).offset(10)
                }
            }, {
                type: "switch",
                props: {
                    id: "mitmSwitch"
                },
                layout: (make, view) => {
                    make.width.equalTo(40)
                    make.height.equalTo(35)
                    make.top.equalTo($("adsSwitch").bottom)
                    make.right.equalTo($("adsSwitch").right)
                },
                events: {
                    changed: sender => {
                        saveWorkspace()
                    }
                }
            }, {
                type: "label",
                props: {
                    text: "使用自定义MITM",
                },
                layout: (make, view) => {
                    make.width.equalTo(200)
                    make.height.equalTo(35)
                    make.left.equalTo(10)
                    make.top.equalTo($("adsSwitch").bottom)
                }
            }, {
                type: "switch",
                props: {
                    id: "tfSwitch"
                },
                layout: (make, view) => {
                    make.width.equalTo(40)
                    make.height.equalTo(35)
                    make.top.equalTo($("mitmSwitch").bottom)
                    make.right.equalTo($("mitmSwitch").right)
                    make.bottom.equalTo(view.super).offset(-50)
                },
                events: {
                    changed: sender => {
                        saveWorkspace()
                    }
                }
            }, {
                type: "label",
                props: {
                    text: "TestFlight（UDP支持）",
                },
                layout: (make, view) => {
                    make.width.equalTo(200)
                    make.height.equalTo(40)
                    make.left.equalTo(10)
                    make.top.equalTo($("mitmSwitch").bottom)
                    make.bottom.equalTo(view.super).offset(-50)
                }
            }]
        }, {
            type: "button",
            props: {
                id: "advanceBtn",
                title: "进阶设置"
            },
            layout: (make, view) => {
                make.width.equalTo(screenWidth * 0.4 - 15)
                // make.centerX.equalTo(view.super)
                make.left.equalTo(10)
                make.height.equalTo(40)
                make.bottom.equalTo(view.super).offset(-10)
            },
            events: {
                tapped: sender => {
                    renderAdvanceUI()
                }
            }
        }, {
            type: "button",
            props: {
                id: "genBtn",
                title: "拉取规则生成配置"
            },
            layout: (make, view) => {
                make.width.equalTo(screenWidth * 0.6 - 15)
                // make.centerX.equalTo(view.super)
                make.height.equalTo(40)
                make.left.equalTo($("advanceBtn").right).offset(10)
                make.bottom.equalTo(view.super).offset(-10)
            },
            events: {
                tapped: sender => {
                    $ui.loading(true)
                    let pu = {
                        apple: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Apple.conf',
                        direct: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/DIRECT.conf',
                        proxy: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/PROXY.conf',
                        reject: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/REJECT.conf',
                        testflight: 'https://raw.githubusercontent.com/lhie1/Rules/master/Surge/TestFlight.conf',
                        host: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/HOST.conf',
                        urlrewrite: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/URL%20Rewrite.conf',
                        urlreject: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/URL%20REJECT.conf',
                        headerrewrite: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Header%20Rewrite.conf',
                        hostname: 'https://raw.githubusercontent.com/lhie1/Rules/master/Auto/Hostname.conf',
                        mitm: 'https://raw.githubusercontent.com/lhie1/Rules/master/Surge/MITM.conf'
                    }
                    let ads = $("adsSwitch").on
                    let isTF = $("tfSwitch").on
                    let isMitm = $("mitmSwitch").on

                    let advanceSettings = JSON.parse($file.read(FILE).string)

                    let autoGroup = $("serverEditor").data.filter(i => cu.isEqual(i.proxyName.bgcolor, selectedColor)).map(i => i.proxyName.text).join(',') || 'DIRECT'
                    let proxies = $("serverEditor").data.map(i => {
                        return i.proxyLink + (isTF ? ',udp-relay=true' : '')
                    }).join('\n')
                    let proxyHeaders = $("serverEditor").data.map(i => i.proxyName.text).join(', ')
                    let rules = ''
                    let prototype = ''
                    let testFlight = ''
                    let host = ''
                    let urlRewrite = ''
                    let urlReject = ''
                    let headerRewrite = ''
                    let hostName = ''
                    let mitm = ''
                    getPrototype().then(res => {
                        prototype = res
                        return getAutoRules(pu.apple)
                    }).then(res => {
                        rules += '\n' + res
                        if (ads) {
                            return getAutoRules(pu.reject)
                        } else {
                            return Promise.resolve('')
                        }
                    }).then(res => {
                        rules += '\n' + res
                        return getAutoRules(pu.proxy)
                    }).then(res => {
                        rules += '\n' + res
                        return getAutoRules(pu.direct)
                    }).then(res => {
                        rules += '\n' + res
                        return getAutoRules(pu.host)
                    }).then(res => {
                        host = res
                        return getAutoRules(pu.urlrewrite)
                    }).then(res => {
                        urlRewrite += res
                        if (ads) {
                            return getAutoRules(pu.urlreject)
                        } else {
                            return Promise.resolve('')
                        }
                    }).then(res => {
                        urlReject += res
                        return getAutoRules(pu.headerrewrite)
                    }).then(res => {
                        headerRewrite = res
                        return getAutoRules(pu.hostname)
                    }).then(res => {
                        hostName = 'hostname = ' + res.split('\n').join(', ')
                        return getAutoRules(pu.mitm)
                    }).then(res => {
                        mitm = res

                        $ui.loading(false)

                        prototype = prototype.replace('dns-server = system', advanceSettings.dnsSettings || 'dns-server = system,1.2.4.8,80.80.80.80,80.80.81.81,1.1.1.1,1.0.0.1')
                        prototype = prototype.replace('# Custom', advanceSettings.customSettings || '')
                        prototype = prototype.replace('Proxys', proxies)
                        prototype = prototype.split('Proxy Header').join(proxyHeaders)
                        prototype = prototype.replace('ProxyHeader', autoGroup)
                        prototype = prototype.replace('# All Rules', rules)
                        // prototype = prototype.replace('// TestFlight', testFlight)
                        prototype = prototype.replace('# Host', host)
                        prototype = prototype.replace('# URL Rewrite', urlRewrite)
                        prototype = prototype.replace('# URL REJECT', urlReject)
                        prototype = prototype.replace('# Header Rewrite', headerRewrite)
                        prototype = prototype.replace('// Hostname', hostName)

                        if (isMitm) {
                            prototype = prototype.replace('# MITM', advanceSettings.mitmSettings || '# MITM')
                        } else {
                            prototype = prototype.replace('# MITM', mitm)
                        }

                        console.log(prototype)
                        $share.sheet([($("fileName").text || 'lhie1') + '.conf', $data({ "string": prototype })])
                    }).catch(() => {
                        $ui.loading(false)
                        $ui.alert("无法生成配置文件，可能是规则仓库发生变化或网络出现问题")
                    })
                }
            }
        }]
    })
}

function getPrototype() {
    return new Promise((resolve, reject) => {
        $http.get({
            url: "https://raw.githubusercontent.com/lhie1/Rules/master/Surge/Prototype.conf",
            handler: function (resp) {
                resolve(resp.data)
            }
        })
    })
}

function getAutoRules(url) {
    return new Promise((resolve, reject) => {
        $http.get({
            url: url,
            handler: function (resp) {
                resolve(resp.data)
            }
        })
    })
}

function importMenu(params) {
    let staticItems = ['剪贴板', '相机扫码', '相册']
    let savedURLS = JSON.parse($file.read(FILE).string).urls
    console.log(savedURLS)
    for (let i = 0; i < savedURLS.length && i < 3; i++) {
        staticItems.unshift(savedURLS[i].name || savedURLS[i])
    }
    $ui.menu({
        items: staticItems,
        handler: function (title, idx) {
            let staticIdx = idx - savedURLS.length
            if (staticIdx == 0) {
                let clipText = $clipboard.text
                linkHandler(clipText, params)
            } else if (staticIdx == 1) {
                $qrcode.scan({
                    handler(string) {
                        linkHandler(string, params)
                    }
                })
            } else if (staticIdx == 2) {
                $photo.pick({
                    format: "image",
                    handler: function (resp) {
                        var image = resp.image
                        linkHandler($qrcode.decode(image), params)
                    }
                })
            } else {
                let lm = savedURLS.length - 1
                let url = savedURLS[lm - idx].url || savedURLS[lm - idx]
                linkHandler(url, params)
            }
        }
    })
}

function linkHandler(url, params) {
    if (url.startsWith('ss')) {
        proxyUtil.proxyFromURL({
            ssURL: url.trim(),
            handler: res => {
                params.handler(res.servers)
                saveURL(url, res.sstag)
            }
        })

    } else if (url.startsWith('http')) {
        $ui.loading(true)
        proxyUtil.proxyFromConf({
            confURL: url.trim(),
            handler: res => {
                params.handler(res.servers)
                $ui.loading(false)
                saveURL(url, res.filename)
            }
        })
    } else if (/[\S\s]+=[\s]*custom,/.test(url)) {
        params.handler([url])
        saveURL(url, url.split('=')[0].trim())
    } else {
        params.handler(null)
    }
}

function saveURL(url, name) {
    let settings = JSON.parse($file.read(FILE).string)
    let urls = settings.urls
    // if (urls.indexOf(url) >= 0) {
    //     urls.splice(urls.indexOf(url), 1)
    // }
    let idx = -1
    urls.forEach((item, i) => {
        if (item == url || item.url == url) {
            idx = i
        }
    })
    if (idx > -1) {
        urls.splice(idx, 1)
    }
    urls.push({ url: url, name: name })
    if (urls.length > 3) {
        urls.shift()
    }
    $file.write({
        data: $data({ "string": JSON.stringify(settings) }),
        path: FILE
    })
}

function write2file(key, value) {
    let content = JSON.parse($file.read(FILE).string)
    content[key] = value
    $file.write({
        data: $data({ "string": JSON.stringify(content) }),
        path: FILE
    })
}

function renderAdvanceUI() {
    let previewData = JSON.parse($file.read(FILE).string)
    $ui.push({
        props: {
            title: "进阶设置"
        },
        views: [{
            type: "view",
            props: {
                id: "advanceMainView"
            },
            layout: $layout.fill,
            views: [{
                type: "text",
                props: {
                    id: "dnsSettings",
                    bgcolor: $color("#f0f5f5"),
                    radius: 5,
                    text: previewData.dnsSettings || 'dns-server = system,1.2.4.8,80.80.80.80,80.80.81.81,1.1.1.1,1.0.0.1'
                },
                layout: (make, view) => {
                    make.top.equalTo(10)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo(80)
                    make.width.equalTo(view.super).offset(-20)
                },
                events: {
                    didEndEditing: sender => {
                        write2file("dnsSettings", $("dnsSettings").text)
                    }
                }
            }, {
                type: "text",
                props: {
                    id: "customSettings",
                    bgcolor: $color("#f0f5f5"),
                    radius: 5,
                    text: previewData.customSettings || '# Custom'
                },
                layout: (make, view) => {
                    make.top.equalTo($("dnsSettings").bottom).offset(10)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo((screenHeight - 190) * 0.6)
                    make.width.equalTo(view.super).offset(-20)
                },
                events: {
                    didEndEditing: sender => {
                        write2file("customSettings", $("customSettings").text)
                    }
                }
            }, {
                type: "text",
                props: {
                    id: "mitmSettings",
                    bgcolor: $color("#f0f5f5"),
                    radius: 5,
                    text: previewData.mitmSettings || '# MITM'
                },
                layout: (make, view) => {
                    make.top.equalTo($("customSettings").bottom).offset(10)
                    make.centerX.equalTo(view.super)
                    make.height.equalTo((screenHeight - 190) * 0.4)
                    make.width.equalTo(view.super).offset(-20)
                },
                events: {
                    didEndEditing: sender => {
                        write2file("mitmSettings", $("mitmSettings").text)
                    }
                }
            }]
        }]
    })
}

function addListener() {
    $app.listen({
        ready: function () {
            let file = JSON.parse($file.read(FILE).string)
            if (file && file.workspace) {
                let workspace = file.workspace
                $("fileName").text = workspace.fileName
                console.log(workspace.serverData)
                $("serverEditor").data = workspace.serverData.map(i => {
                    i.proxyName.bgcolor = i.proxyName.bgcolor ? selectedColor : defaultColor
                    return i
                })
                $("adsSwitch").on = workspace.isAds
                $("tfSwitch").on = workspace.isTF
                $("mitmSwitch").on = workspace.isMitm
            }
        },
        exit: function () {

        }
    })
}

function saveWorkspace() {
    let workspace = {
        fileName: $("fileName").text,
        serverData: $("serverEditor").data.map(i => {
            // 如果节点选上，则color为true
            i.proxyName.bgcolor = cu.isEqual(selectedColor, i.proxyName.bgcolor)
            return i
        }),
        isAds: $("adsSwitch").on,
        isTF: $("tfSwitch").on,
        isMitm: $("mitmSwitch").on
    }
    let file = JSON.parse($file.read(FILE).string)
    file.workspace = workspace
    $file.write({
        data: $data({ string: JSON.stringify(file) }),
        path: FILE
    })
}


module.exports = {
    renderUI: renderUI,
    addListener: addListener
}