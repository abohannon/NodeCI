const Page = require('./helpers/page')

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
});

afterEach(async () => {
  await page.close();
})

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating')
  })

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label')
  
    expect(label).toEqual('Blog Title')
  })

  describe('and using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Test title')
      await page.type('.content input', 'Test content')
      await page.click('form button')
    })

    test('submitting takes user to review screen', async () => {
      const title = await page.getContentsOf('form h5')
      expect(title).toEqual('Please confirm your entries')
    })

    test('submitting then saving adds blog to index page', async () => {
      await page.click('button.green')
      await page.waitFor('.card-content')
      const title = await page.getContentsOf('.card-content .card-title')
      const content = await page.getContentsOf('.card-content p')

      expect(title).toEqual('Test title')
      expect(content).toEqual('Test content')
    })
  })

  describe('and using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button')
    })

    test('the form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text')
      const contentError = await page.getContentsOf('.content .red-text')
      const errorMessage = 'You must provide a value'

      expect(titleError).toEqual(errorMessage)
      expect(contentError).toEqual(errorMessage)
    })
  })
})

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ]

  // Advanced technique of commented out code below
  test('Blog related actions are prohibited', async () => {
    const results = await page.execRequests(actions)

    for (let result of results) {
      expect(result).toEqual({ error: 'You must log in!' })
    }
  })

  // test('user cannot create blog posts', async () => {
  //   const result = await page.post(
  //     '/api/blogs',
  //     { title: 'Test Title', content: 'Test Content'},
  //   )
  //   expect(result).toEqual({ error: 'You must log in!'})
  // })

  // test('user cannot get a list of posts', async () => {
  //   const result = await page.get('/api/blogs')
  //   expect(result).toEqual({ error: 'You must log in!' })
  // })
})