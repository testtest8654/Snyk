let theme
let currentTheme = 'primary'
let currentMode = 'light'
fetch("theme.php")
  .then((res) => res.json())
  .then((serverTheme) => {
    theme = serverTheme
})

showBtn.onclick = () => {
  main.style.display = 'block'
  notice.style.display = 'none'
}

document.querySelector('form').addEventListener('click', (e) => {
  const target = e.target
  if (target.nodeName !== 'INPUT' || target.type !== 'radio') return
  if (target.name === 'mode') {
    currentMode = target.value
  } else if (target.name === 'theme') {
    currentTheme = target.value
  }
  updateStyle()
})

function updateStyle() {
  const element = document.querySelector('.buiness-card')
  element.style.setProperty('color', theme?.[currentTheme]?.text?.[currentMode])
  element.style.setProperty('background', theme?.[currentTheme]?.bg?.[currentMode])
}