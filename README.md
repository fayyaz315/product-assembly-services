# Shopify Assembly Service Add-On with Cart Transform Functions by Fayyaz Ahmed

A complete Shopify app that allows customers to add optional assembly services to their products using Cart Transform Functions. This app demonstrates how to build dynamic cart bundling with customer opt-in functionality.

## 📋 Features

- ✅ **Optional Assembly Service**: Customers can opt-in via checkbox on product page
- ✅ **Dynamic Pricing**: Assembly service cost configured per product via metafields
- ✅ **Cart Transform Function**: Automatically bundles product + assembly service
- ✅ **Clean UI**: Styled checkbox component with price display
- ✅ **Currency Support**: Works with multi-currency stores
- ✅ **Mobile Responsive**: Optimized for all screen sizes

## 🎯 Demo

![Assembly Service Checkbox](docs/images/checkbox-demo.png)
![Cart with Bundle](docs/images/cart-bundle.png)

## 🏗️ Architecture

```
┌─────────────────┐
│  Product Page   │
│   - Checkbox    │
│   - Price       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Add to Cart   │
│  + Attribute    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Cart Transform  │
│   Function      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Expanded Cart  │
│  - Product      │
│  - Assembly     │
└─────────────────┘
```

## 📦 Prerequisites

- Shopify Partner account
- Development store
- Node.js 20 or higher
- Shopify CLI 3.x or higher

```bash
npm install -g @shopify/cli@latest
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/shopify-assembly-service.git
cd shopify-assembly-service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Connect to Your Shopify Store

```bash
shopify app dev
```

Follow the prompts to:
- Select your Partner organization
- Choose your development store
- Install the app

### 4. Deploy the App

```bash
shopify app deploy
```

## ⚙️ Configuration

### Step 1: Create Assembly Service Product

1. In your Shopify admin, create a new product:
   - **Name**: "Assembly Service"
   - **Price**: $0.00 (the function will set the actual price)
   - **Visibility**: Hidden from sales channels
2. Note the **variant ID** (you'll need this later)

### Step 2: Configure Metafields

The app automatically creates these metafield definitions:

#### Product Metafield (Assembly Cost)
- **Namespace**: `$app:assembly-service`
- **Key**: `cost`
- **Type**: JSON
- **Format**: `{"amount":"10.0"}`

#### Cart Transform Metafield (Variant ID)
- **Namespace**: `$app:optional-add-ons`
- **Key**: `function-configuration`
- **Type**: Single line text

### Step 3: Set Metafield Values via GraphQL

Open your store's GraphQL Admin API (https://yourstore.myshopify.com/admin/api/graphiql.json) and run these mutations:

#### A. Get Cart Transform ID

```graphql
query GetCartTransform {
  cartTransforms(first: 10) {
    nodes {
      id
      functionId
    }
  }
}
```

#### B. Set Assembly Service Variant ID

```graphql
mutation SetAssemblyServiceVariant {
  metafieldsSet(
    metafields: [
      {
        ownerId: "gid://shopify/CartTransform/YOUR_CART_TRANSFORM_ID"
        namespace: "$app:optional-add-ons"
        key: "function-configuration"
        type: "single_line_text_field"
        value: "gid://shopify/ProductVariant/YOUR_ASSEMBLY_VARIANT_ID"
      }
    ]
  ) {
    metafields {
      id
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

#### C. Set Assembly Cost on Product

```graphql
mutation SetAssemblyServiceCost {
  metafieldsSet(
    metafields: [
      {
        ownerId: "gid://shopify/Product/YOUR_PRODUCT_ID"
        namespace: "$app:assembly-service"
        key: "cost"
        type: "json"
        value: "{\"amount\":\"10.0\"}"
      }
    ]
  ) {
    metafields {
      id
      value
    }
    userErrors {
      field
      message
    }
  }
}
```

### Step 4: Add Checkbox to Theme

1. Go to **Online Store** → **Themes** → **Edit code**
2. Open `sections/main-product.liquid`
3. Find the product form (`<form method="post" action="/cart/add"`)
4. Add this code **inside the form, before the Add to Cart button**:

```liquid
{% assign assembly_cost = product.metafields['app--YOUR_APP_ID--assembly-service'].cost %}

{% if assembly_cost %}
  {% assign cost_data = assembly_cost.value | parse_json %}
  
  <div class="product-assembly-service">
    <div class="assembly-service-wrapper">
      <label class="assembly-service-label">
        <input 
          type="checkbox" 
          name="properties[Assembly Service Added]" 
          value="Yes"
          class="assembly-service-checkbox"
        >
        <span class="assembly-service-text">
          Add Assembly Service 
          <span class="assembly-service-price">(+${{ cost_data.amount | default: '10.00' }})</span>
        </span>
      </label>
      <p class="assembly-service-description">
        Professional assembly service for your product
      </p>
    </div>
  </div>

  <style>
    .product-assembly-service {
      margin: 1.5rem 0;
    }
    
    .assembly-service-wrapper {
      padding: 1rem;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      background-color: #f9f9f9;
      transition: background-color 0.2s ease;
    }
    
    .assembly-service-wrapper:hover {
      background-color: #f5f5f5;
    }
    
    .assembly-service-label {
      display: flex;
      align-items: center;
      cursor: pointer;
      font-weight: 500;
      user-select: none;
    }
    
    .assembly-service-checkbox {
      width: 20px;
      height: 20px;
      margin-right: 10px;
      cursor: pointer;
      accent-color: #2c7a3f;
    }
    
    .assembly-service-text {
      font-size: 16px;
    }
    
    .assembly-service-price {
      color: #2c7a3f;
      font-weight: 600;
    }
    
    .assembly-service-description {
      margin: 8px 0 0 30px;
      font-size: 14px;
      color: #666;
      line-height: 1.5;
    }
    
    @media screen and (max-width: 749px) {
      .product-assembly-service {
        margin: 1rem 0;
      }
      
      .assembly-service-wrapper {
        padding: 0.75rem;
      }
      
      .assembly-service-text {
        font-size: 14px;
      }
      
      .assembly-service-description {
        font-size: 13px;
      }
    }
  </style>
{% endif %}
```

> **Note**: Replace `YOUR_APP_ID` with your actual app ID. Find it in the Shopify admin under your metafield namespace (e.g., `app--310289596417--assembly-service`).

## 📁 Project Structure

```
shopify-assembly-service/
├── extensions/
│   └── cart-add-on-expander/
│       ├── src/
│       │   ├── run.graphql          # GraphQL input query
│       │   └── run.ts               # Cart transform function logic
│       └── shopify.extension.toml   # Extension configuration
├── shopify.app.toml                 # App configuration & metafields
├── package.json
└── README.md
```

## 🔧 How It Works

### 1. Customer Interaction
- Customer visits product page
- Sees assembly service checkbox with price
- Checks the box and adds product to cart

### 2. Cart Attribute
- Form submission includes: `properties[Assembly Service Added]: "Yes"`
- Cart line now has this attribute attached

### 3. Cart Transform Function
The function:
1. Reads the cart line attribute
2. Checks if product has assembly cost configured
3. Gets assembly service variant ID from cart transform metafield
4. Expands the single cart line into two items:
   - Original product at original price
   - Assembly service at configured price

### 4. Result
- Customer sees bundled items in cart
- Both items proceed to checkout
- Total price = Product + Assembly Service

## 🛠️ Development

### Run Local Development Server

```bash
shopify app dev
```

This starts:
- Local development server
- Tunnel for testing
- Hot reload for function changes

### View Function Logs

```bash
# Logs are saved in:
.shopify/logs/
```

### Test Function Locally

```bash
shopify app function run
```

### Deploy Changes

```bash
shopify app deploy
```

## 📊 GraphQL Input Query

The function fetches this data:

```graphql
query Input {
  presentmentCurrencyRate              # For currency conversion
  cart {
    lines {
      id                                # Cart line ID
      quantity
      cost {
        amountPerQuantity {
          amount                        # Product price
          currencyCode
        }
      }
      assemblyServiceAdded: attribute(key: "Assembly Service Added") {
        value                           # "Yes" if checked
      }
      merchandise {
        ... on ProductVariant {
          id                            # Product variant ID
          title
          product {
            assemblyServiceCost: metafield(
              namespace: "$app:assembly-service"
              key: "cost"
            ) {
              jsonValue                 # {"amount": "10.0"}
            }
          }
        }
      }
    }
  }
  cartTransform {
    assemblyServiceVariantID: metafield(
      namespace: "$app:optional-add-ons"
      key: "function-configuration"
    ) {
      value                             # Assembly service variant ID
    }
  }
}
```

## 🎨 Customization

### Change Assembly Service Price

Update the metafield on each product:

```graphql
mutation {
  metafieldsSet(
    metafields: [{
      ownerId: "gid://shopify/Product/YOUR_PRODUCT_ID"
      namespace: "$app:assembly-service"
      key: "cost"
      type: "json"
      value: "{\"amount\":\"15.0\"}"  # Change to desired price
    }]
  ) {
    metafields { id value }
    userErrors { field message }
  }
}
```

### Customize Checkbox Styling

Edit the `<style>` section in your Liquid code to match your theme:

```css
.assembly-service-wrapper {
  padding: 1rem;
  border: 1px solid #YOUR_COLOR;
  border-radius: 8px;
  background-color: #YOUR_BG_COLOR;
}

.assembly-service-price {
  color: #YOUR_ACCENT_COLOR;
  font-weight: 600;
}
```

### Change Text Labels

Edit the Liquid template:

```liquid
<span class="assembly-service-text">
  Add Professional Assembly  <!-- Change this text -->
  <span class="assembly-service-price">(+${{ cost_data.amount }})</span>
</span>
<p class="assembly-service-description">
  Expert assembly in 24 hours  <!-- Change this description -->
</p>
```

## 🐛 Troubleshooting

### Checkbox Not Sending Property

**Problem**: Property not appearing in cart

**Solution**: 
- Ensure checkbox is **inside** the `<form>` tags
- Check browser console for form data on submit
- Verify the `name` attribute is exactly: `properties[Assembly Service Added]`

### Function Not Executing

**Problem**: Items not bundling in cart

**Solution**:
- Check function logs: `.shopify/logs/`
- Verify metafields are set correctly via GraphQL
- Test input query in GraphiQL to ensure data is available
- Make sure cart transform is enabled

### Price Not Displaying

**Problem**: Checkbox shows `(+$)` with no amount

**Solution**:
- Metafield must be set with correct JSON format: `{"amount":"10.0"}`
- Use `parse_json` filter in Liquid
- Check metafield namespace matches your app ID

### Assembly Service Not Added to Cart

**Problem**: Only original product in cart, no assembly service

**Solution**:
- Verify assembly service variant ID is set in cart transform metafield
- Check that product has assembly cost metafield set
- Ensure checkbox was checked before adding to cart
- Review function logs for errors

## 📝 API Reference

### Metafield Definitions

#### Product Assembly Cost
```toml
[product.metafields.assembly-service.cost]
name = "Assembly Service Cost"
type = "json"
access.admin = "merchant_read_write"
```

**Value Format**: `{"amount":"10.0"}`

#### Cart Transform Configuration
```toml
[cart_transform.metafields.optional-add-ons.function-configuration]
name = "Assembly Service Variant ID"
type = "single_line_text_field"
access.admin = "merchant_read_write"
```

**Value Format**: `gid://shopify/ProductVariant/12345`

### Cart Transform Output

```typescript
{
  operations: [{
    lineExpand: {
      cartLineId: "gid://shopify/CartLine/abc123",
      title: "Product Name with Assembly Service",
      expandedCartItems: [
        {
          merchandiseId: "gid://shopify/ProductVariant/111",
          quantity: 1,
          price: {
            adjustment: {
              fixedPricePerUnit: { amount: "50.0" }
            }
          }
        },
        {
          merchandiseId: "gid://shopify/ProductVariant/222",
          quantity: 1,
          price: {
            adjustment: {
              fixedPricePerUnit: { amount: "10.0" }
            }
          }
        }
      ]
    }
  }]
}
```

## 🚀 Use Cases

This pattern can be extended to:

- 🎁 **Gift Wrapping**: Add gift wrap service to products
- 🛡️ **Extended Warranties**: Offer product protection plans
- 📦 **Insurance**: Shipping insurance at checkout
- 🎨 **Customization**: Engraving or personalization services
- ⚙️ **Installation**: Professional installation services
- 🔧 **Setup Services**: Configuration and setup assistance

## 📚 Resources

- [Shopify Functions Documentation](https://shopify.dev/docs/api/functions)
- [Cart Transform Functions](https://shopify.dev/docs/api/functions/reference/cart-transform)
- [Metafields Guide](https://shopify.dev/docs/apps/build/custom-data/metafields)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [GraphQL Admin API](https://shopify.dev/docs/api/admin-graphql)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

- 📧 Email: your-email@example.com
- 💬 Discord: [Your Discord Server](https://discord.gg/yourinvite)
- 🐦 Twitter: [@yourhandle](https://twitter.com/yourhandle)

## 🙏 Acknowledgments

- Shopify Developer Relations team for excellent documentation
- Shopify Functions team for building this powerful platform
- Community contributors

## ⭐ Star History

If you find this project helpful, please give it a star! ⭐

---

**Built with ❤️ using Shopify Functions**


# Shopify App Template - React Router - Fayyaz Ahmed 

This is a template for building a [Shopify app](https://shopify.dev/docs/apps/getting-started) using [React Router](https://reactrouter.com/).  It was forked from the [Shopify Remix app template](https://github.com/Shopify/shopify-app-template-remix) and converted to React Router.

Rather than cloning this repo, follow the [Quick Start steps](https://github.com/Shopify/shopify-app-template-react-router#quick-start).

Visit the [`shopify.dev` documentation](https://shopify.dev/docs/api/shopify-app-react-router) for more details on the React Router app package.

## Upgrading from Remix

If you have an existing Remix app that you want to upgrade to React Router, please follow the [upgrade guide](https://github.com/Shopify/shopify-app-template-react-router/wiki/Upgrading-from-Remix).  Otherwise, please follow the quick start guide below.

## Quick start

### Prerequisites

Before you begin, you'll need the following:

1. **Node.js**: [Download and install](https://nodejs.org/en/download/) it if you haven't already.
2. **Shopify Partner Account**: [Create an account](https://partners.shopify.com/signup) if you don't have one.
3. **Test Store**: Set up either a [development store](https://help.shopify.com/en/partners/dashboard/development-stores#create-a-development-store) or a [Shopify Plus sandbox store](https://help.shopify.com/en/partners/dashboard/managing-stores/plus-sandbox-store) for testing your app.
4. **Shopify CLI**: [Download and install](https://shopify.dev/docs/apps/tools/cli/getting-started) it if you haven't already.
```shell
npm install -g @shopify/cli@latest
```

### Setup

```shell
shopify app init --template=https://github.com/Shopify/shopify-app-template-react-router
```

### Local Development

```shell
shopify app dev
```

Press P to open the URL to your app. Once you click install, you can start development.

Local development is powered by [the Shopify CLI](https://shopify.dev/docs/apps/tools/cli). It logs into your partners account, connects to an app, provides environment variables, updates remote config, creates a tunnel and provides commands to generate extensions.

### Authenticating and querying data

To authenticate and query data you can use the `shopify` const that is exported from `/app/shopify.server.js`:

```js
export async function loader({ request }) {
  const { admin } = await shopify.authenticate.admin(request);

  const response = await admin.graphql(`
    {
      products(first: 25) {
        nodes {
          title
          description
        }
      }
    }`);

  const {
    data: {
      products: { nodes },
    },
  } = await response.json();

  return nodes;
}
```

This template comes pre-configured with examples of:

1. Setting up your Shopify app in [/app/shopify.server.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/shopify.server.ts)
2. Querying data using Graphql. Please see: [/app/routes/app.\_index.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/app._index.tsx).
3. Responding to webhooks. Please see [/app/routes/webhooks.tsx](https://github.com/Shopify/shopify-app-template-react-router/blob/main/app/routes/webhooks.app.uninstalled.tsx).

Please read the [documentation for @shopify/shopify-app-react-router](https://shopify.dev/docs/api/shopify-app-react-router) to see what other API's are available.

## Shopify Dev MCP

This template is configured with the Shopify Dev MCP. This instructs [Cursor](https://cursor.com/), [GitHub Copilot](https://github.com/features/copilot) and [Claude Code](https://claude.com/product/claude-code) and [Google Gemini CLI](https://github.com/google-gemini/gemini-cli) to use the Shopify Dev MCP.  

For more information on the Shopify Dev MCP please read [the  documentation](https://shopify.dev/docs/apps/build/devmcp).

## Deployment

### Application Storage

This template uses [Prisma](https://www.prisma.io/) to store session data, by default using an [SQLite](https://www.sqlite.org/index.html) database.
The database is defined as a Prisma schema in `prisma/schema.prisma`.

This use of SQLite works in production if your app runs as a single instance.
The database that works best for you depends on the data your app needs and how it is queried.
Here’s a short list of databases providers that provide a free tier to get started:

| Database   | Type             | Hosters                                                                                                                                                                                                                               |
| ---------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| MySQL      | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mysql), [Planet Scale](https://planetscale.com/), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/mysql) |
| PostgreSQL | SQL              | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-postgresql), [Amazon Aurora](https://aws.amazon.com/rds/aurora/), [Google Cloud SQL](https://cloud.google.com/sql/docs/postgres)                                   |
| Redis      | Key-value        | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-redis), [Amazon MemoryDB](https://aws.amazon.com/memorydb/)                                                                                                        |
| MongoDB    | NoSQL / Document | [Digital Ocean](https://www.digitalocean.com/products/managed-databases-mongodb), [MongoDB Atlas](https://www.mongodb.com/atlas/database)                                                                                                  |

To use one of these, you can use a different [datasource provider](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference#datasource) in your `schema.prisma` file, or a different [SessionStorage adapter package](https://github.com/Shopify/shopify-api-js/blob/main/packages/shopify-api/docs/guides/session-storage.md).

### Build

Build the app by running the command below with the package manager of your choice:

Using yarn:

```shell
yarn build
```

Using npm:

```shell
npm run build
```

Using pnpm:

```shell
pnpm run build
```

## Hosting

When you're ready to set up your app in production, you can follow [our deployment documentation](https://shopify.dev/docs/apps/launch/deployment) to host it externally. From there, you have a few options:

- [Google Cloud Run](https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run): This tutorial is written specifically for this example repo, and is compatible with the extended steps included in the subsequent [**Build your app**](tutorial) in the **Getting started** docs. It is the most detailed tutorial for taking a React Router-based Shopify app and deploying it to production. It includes configuring permissions and secrets, setting up a production database, and even hosting your apps behind a load balancer across multiple regions. 
- [Fly.io](https://fly.io/docs/js/shopify/): Leverages the Fly.io CLI to quickly launch Shopify apps to a single machine. 
- [Render](https://render.com/docs/deploy-shopify-app): This tutorial guides you through using Docker to deploy and install apps on a Dev store. 
- [Manual deployment guide](https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service): This resource provides general guidance on the requirements of deployment including environment variables, secrets, and persistent data. 

When you reach the step for [setting up environment variables](https://shopify.dev/docs/apps/deployment/web#set-env-vars), you also need to set the variable `NODE_ENV=production`.

## Gotchas / Troubleshooting

### Database tables don't exist

If you get an error like:

```
The table `main.Session` does not exist in the current database.
```

Create the database for Prisma. Run the `setup` script in `package.json` using `npm`, `yarn` or `pnpm`.

### Navigating/redirecting breaks an embedded app

Embedded apps must maintain the user session, which can be tricky inside an iFrame. To avoid issues:

1. Use `Link` from `react-router` or `@shopify/polaris`. Do not use `<a>`.
2. Use `redirect` returned from `authenticate.admin`. Do not use `redirect` from `react-router`
3. Use `useSubmit` from `react-router`.

This only applies if your app is embedded, which it will be by default.

### Webhooks: shop-specific webhook subscriptions aren't updated

If you are registering webhooks in the `afterAuth` hook, using `shopify.registerWebhooks`, you may find that your subscriptions aren't being updated.  

Instead of using the `afterAuth` hook declare app-specific webhooks in the `shopify.app.toml` file.  This approach is easier since Shopify will automatically sync changes every time you run `deploy` (e.g: `npm run deploy`).  Please read these guides to understand more:

1. [app-specific vs shop-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions)
2. [Create a subscription tutorial](https://shopify.dev/docs/apps/build/webhooks/subscribe/get-started?deliveryMethod=https)

If you do need shop-specific webhooks, keep in mind that the package calls `afterAuth` in 2 scenarios:

- After installing the app
- When an access token expires

During normal development, the app won't need to re-authenticate most of the time, so shop-specific subscriptions aren't updated. To force your app to update the subscriptions, uninstall and reinstall the app. Revisiting the app will call the `afterAuth` hook.

### Webhooks: Admin created webhook failing HMAC validation

Webhooks subscriptions created in the [Shopify admin](https://help.shopify.com/en/manual/orders/notifications/webhooks) will fail HMAC validation. This is because the webhook payload is not signed with your app's secret key.  

The recommended solution is to use [app-specific webhooks](https://shopify.dev/docs/apps/build/webhooks/subscribe#app-specific-subscriptions) defined in your toml file instead.  Test your webhooks by triggering events manually in the Shopify admin(e.g. Updating the product title to trigger a `PRODUCTS_UPDATE`).

### Webhooks: Admin object undefined on webhook events triggered by the CLI

When you trigger a webhook event using the Shopify CLI, the `admin` object will be `undefined`. This is because the CLI triggers an event with a valid, but non-existent, shop. The `admin` object is only available when the webhook is triggered by a shop that has installed the app.  This is expected.

Webhooks triggered by the CLI are intended for initial experimentation testing of your webhook configuration. For more information on how to test your webhooks, see the [Shopify CLI documentation](https://shopify.dev/docs/apps/tools/cli/commands#webhook-trigger).

### Incorrect GraphQL Hints

By default the [graphql.vscode-graphql](https://marketplace.visualstudio.com/items?itemName=GraphQL.vscode-graphql) extension for will assume that GraphQL queries or mutations are for the [Shopify Admin API](https://shopify.dev/docs/api/admin). This is a sensible default, but it may not be true if:

1. You use another Shopify API such as the storefront API.
2. You use a third party GraphQL API.

If so, please update [.graphqlrc.ts](https://github.com/Shopify/shopify-app-template-react-router/blob/main/.graphqlrc.ts).

### Using Defer & await for streaming responses

By default the CLI uses a cloudflare tunnel. Unfortunately  cloudflare tunnels wait for the Response stream to finish, then sends one chunk.  This will not affect production.

To test [streaming using await](https://reactrouter.com/api/components/Await#await) during local development we recommend [localhost based development](https://shopify.dev/docs/apps/build/cli-for-apps/networking-options#localhost-based-development).

### "nbf" claim timestamp check failed

This is because a JWT token is expired.  If you  are consistently getting this error, it could be that the clock on your machine is not in sync with the server.  To fix this ensure you have enabled "Set time and date automatically" in the "Date and Time" settings on your computer.

### Using MongoDB and Prisma

If you choose to use MongoDB with Prisma, there are some gotchas in Prisma's MongoDB support to be aware of. Please see the [Prisma SessionStorage README](https://www.npmjs.com/package/@shopify/shopify-app-session-storage-prisma#mongodb).

### Unable to require(`C:\...\query_engine-windows.dll.node`).

Unable to require(`C:\...\query_engine-windows.dll.node`).
  The Prisma engines do not seem to be compatible with your system.

  query_engine-windows.dll.node is not a valid Win32 application.

**Fix:** Set the environment variable:
```shell
PRISMA_CLIENT_ENGINE_TYPE=binary
```

This forces Prisma to use the binary engine mode, which runs the query engine as a separate process and can work via emulation on Windows ARM64.

## Resources

React Router:

- [React Router docs](https://reactrouter.com/home)

Shopify:

- [Intro to Shopify apps](https://shopify.dev/docs/apps/getting-started)
- [Shopify App React Router docs](https://shopify.dev/docs/api/shopify-app-react-router)
- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli)
- [Shopify App Bridge](https://shopify.dev/docs/api/app-bridge-library).
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components).
- [App extensions](https://shopify.dev/docs/apps/app-extensions/list)
- [Shopify Functions](https://shopify.dev/docs/api/functions)

Internationalization:

- [Internationalizing your app](https://shopify.dev/docs/apps/best-practices/internationalization/getting-started)
