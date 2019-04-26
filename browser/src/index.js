import errCodeMsg from '../../lib/err_code_msg'

const WebSocket = window.WebSocket

export const connect = generate_connect(false)
export const open_connect = generate_connect(true)

function generate_connect (_open_handler = false) {
  return function (url) {
    let id = 0
    let sock

    /* send queue */
    let sq = {}
    // eslint-disable-next-line
    let sq_cnt = 0

    /* response queue */
    let rq = {}
    // eslint-disable-next-line
    let rq_cnt = 0

    function reconnect () {
      sock = new WebSocket(url)
      sock.onclose = () => {
        if (rq_cnt) {
          for (const r in rq) {
            const o = rq[r]
            o.v = {
              id: o.r.id,
              error: {
                code: -32000,
                message: errCodeMsg['32000']
              }
            }
          }

          rq = {}
          rq_cnt = 0
        }

        reconnect()
      }

      sock.onerror = (evt) => {
        console.error(evt)
      }

      sock.onopen = () => {
        if (sq_cnt) {
          for (const r in sq) {
            const o = sq[r]

            sock.send(JSON.stringify(o.r))

            rq[o.r.id] = o
            rq_cnt++
          }
          sq = {}
          sq_cnt = 0
        }
      }

      sock.onmessage = (m) => {
        let v = null, err = null
        try {
          v = JSON.parse(m.data)
        } catch (ex) {
          err = ex
        }

        const o = rq[v.id]

        if (err) {
          o.error = err
        }

        if (v.error) {
          o.error = v.error
        } else {
          o.v = v
        }

        if (o !== undefined) {
          delete rq[v.id]
          rq_cnt--
        }
      }
    }

    reconnect()

    return {
      call: function (name, ...params) {
        const _id = id++
        const o = {
          r: {
            id: _id,
            method: name,
            params: _open_handler ? params[0] : params
          },
          p: new Promise(function (resolve, reject) {
            const interval = setInterval(() => {
              if (rq[_id]) {
                return
              }

              if (o.error) {
                reject(o.error)
                clearInterval(interval)
                return
              }

              clearInterval(interval)
              console.log('o.v', o.v)
              resolve(o.v.result)
            })
          })
        }

        try {
          sock.send(JSON.stringify(o.r))

          rq[_id] = o
          rq_cnt++
        } catch (e) {
          sq[_id] = o
          sq_cnt++
        }

        return o.p
      }
    }
  }
}
