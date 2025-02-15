let isDarkMode = false
let theme

initTheme()
document.querySelector('.btn-update-name').addEventListener('click', () => {
  const name = prompt('Please input new name')
  if (!name) return
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content
  fetch('./update-name.php', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    credentials: 'include',
    body: `csrf-token=${encodeURIComponent(csrfToken)}&name=${encodeURIComponent(name)}`
  })
  .then(r => r.text())
  .then(res => {
    if (res === 'success') {
      document.querySelector('#nameField').value = name
    }
    alert(res)
  }).catch(e => {
    alert('Failed:' + e.toString())
  })
})

function initTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    isDarkMode = true
  }

  fetch("theme.php")
    .then((res) => res.json())
    .then((serverTheme) => {
      theme = {
        primary: {},
        secondary: {}
      }

      for(let themeName in serverTheme) {
        const currentTheme = theme[themeName]
        const currentServerTheme = serverTheme[themeName]

        for(let item in currentServerTheme) {
          currentTheme[item] = () => isDarkMode ? currentServerTheme[item].dark : currentServerTheme[item].light
        }
      }

      const themeDiv = document.querySelector('.theme-text')
      themeDiv.innerText = `Primary - Text: ${theme?.primary?.text()}, Background: ${theme?.primary?.bg()}
        Secondary - Text: ${theme?.secondary?.text()}, Background: ${theme?.secondary?.bg()}
      `
      start()
    })
}


function start() {
  const message = decodeURIComponent(location.hash.replace('#msg=', ''))
  if (!message.length) return
  const options = {}
  if (document.domain.match(/testing/)) {
    options['production'] = false
  } else {
    options['production'] = true
    options['timeout'] = () => Math.random()*300 + 300
  }
  showMessage(message, {
    container: document.querySelector('body'),
    ...options
  })
}

function showMessage(message, options) {
  const getTimeout = options.timeout || (() => 500)
  const container = options.container || document.querySelector('body')

  const modal = document.createElement('div')
  modal.id = 'messageModal'
  modal.innerHTML = DOMPurify.sanitize(message)
  container.appendChild(modal)
  history.replaceState(null, null, ' ')

  setTimeout(() => {
    container.removeChild(modal)
  }, getTimeout())
}