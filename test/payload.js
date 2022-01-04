const fetch = require('../lib/fetch')
const getPayload = require('../lib/payload')

const GUNDAM_ID = '2KAWnD'

async function getTemplateData() {
  const text = await fetch(
    `https://market.waimai.meituan.com/api/template/get?env=current&el_biz=waimai&el_page=gundam.loader&gundam_id=${GUNDAM_ID}`
  ).then((rep) => rep.text())
  const matchGlobal = text.match(/globalData: ({.+})/)
  const matchAppJs = text.match(/https:\/\/[./_-\w]+app\.js(?=")/g)

  try {
    const globalData = JSON.parse(matchGlobal[1])

    return {
      gundamId: globalData.gdId,
      appJs: matchAppJs[0]
    }
  } catch (e) {
    throw new Error(`活动配置数据获取失败: ${e}`)
  }
}

test('获取模板数据', () => {
  return getTemplateData().then((res) =>
    expect(res).toMatchObject({
      gundamId: expect.anything(),
      appJs: expect.stringMatching(/app.js$/)
    })
  )
})

test('获取 payload', async () => {
  const { gundamId, appJs } = await getTemplateData()

  return getPayload(gundamId, appJs).then((res) =>
    expect(res).toMatchObject({
      actualLatitude: '',
      actualLongitude: '',
      couponConfigIdOrderCommaString: expect.any(String),
      defaultGrabKey: expect.any(String),
      grabKey: expect.any(String),
      gundamId: gundamId,
      needTj: expect.any(Boolean)
    })
  )
})
