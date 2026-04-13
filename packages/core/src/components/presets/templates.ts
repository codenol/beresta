/**
 * JSX templates for all built-in component archetypes.
 *
 * Each template is a JSX string compatible with the design-jsx renderer.
 * Colors reference Semantic design token variables (var:token/path)
 * that come from light.tokens.json / dark.tokens.json.
 * Dimensions reference Dimensions tokens (var:border-radius/S, var:spacing/spacer-800).
 *
 * Token reference:
 *   Radii:   var:border-radius/none (0), XXS (2), XS (4), S (6), M (8), L (10), XL (12), XXL (16), XXXXL (4000)
 *   Spacing: var:spacing/spacer-200 (4), spacer-400 (8), spacer-600 (12), spacer-800 (16), spacer-1000 (20), spacer-1200 (24)
 */

export const COMPONENT_TEMPLATES: Record<string, string> = {

  // ── Action ────────────────────────────────────────────────────────────────

  button: `
    <Frame flex="row" bg="var:button/filled/accent/background/default"
           rounded="var:border-radius/S" px={16} py={8}
           items="center" gap={8} hug="both">
      <Text color="var:button/filled/accent/text/default"
            fontSize={14} fontWeight={500}>Button</Text>
    </Frame>
  `,

  'icon-button': `
    <Frame flex="row" bg="var:button/filled/accent/background/default"
           rounded="var:border-radius/S" w={36} h={36}
           items="center" justify="center">
      <Icon name="lucide:plus" size={16} color="var:button/filled/accent/text/default" />
    </Frame>
  `,

  // ── Input ─────────────────────────────────────────────────────────────────

  input: `
    <Frame flex="col" gap={4} hug="both">
      <Text color="var:input/lable/text/default" fontSize={12} fontWeight={500}>Label</Text>
      <Frame flex="row" bg="var:input/background/default"
             stroke="var:input/border/default" strokeWeight={1}
             rounded="var:border-radius/S" px={12} py={10}
             w={240} items="center" gap={8}>
        <Text color="var:input/text/default" fontSize={14} grow={1}>Placeholder...</Text>
      </Frame>
      <Text color="var:input/hint/default" fontSize={12}>Hint text</Text>
    </Frame>
  `,

  textarea: `
    <Frame flex="col" gap={4} hug="both">
      <Text color="var:input/lable/text/default" fontSize={12} fontWeight={500}>Label</Text>
      <Frame flex="col" bg="var:input/background/default"
             stroke="var:input/border/default" strokeWeight={1}
             rounded="var:border-radius/S" px={12} py={10}
             w={240} h={96} items="start">
        <Text color="var:input/text/default" fontSize={14}>Placeholder...</Text>
      </Frame>
    </Frame>
  `,

  select: `
    <Frame flex="col" gap={4} hug="both">
      <Text color="var:dropdown/lable/text/default" fontSize={12} fontWeight={500}>Label</Text>
      <Frame flex="row" bg="var:dropdown/background/default"
             stroke="var:dropdown/border/default" strokeWeight={1}
             rounded="var:border-radius/S" px={12} py={10}
             w={240} items="center" gap={8}>
        <Text color="var:dropdown/text/default" fontSize={14} grow={1}>Select option...</Text>
        <Icon name="lucide:chevron-down" size={16} color="var:dropdown/icon/default" />
      </Frame>
    </Frame>
  `,

  checkbox: `
    <Frame flex="row" gap={8} items="center" hug="both">
      <Frame w={18} h={18}
             bg="var:checkbox/checked/background/default"
             stroke="var:checkbox/checked/border/default" strokeWeight={1.5}
             rounded="var:border-radius/XXS"
             items="center" justify="center">
        <Icon name="lucide:check" size={12} color="var:checkbox/checked/icon/default" />
      </Frame>
      <Text color="var:checkbox/checked/text/default" fontSize={14}>Checkbox label</Text>
    </Frame>
  `,

  radio: `
    <Frame flex="row" gap={8} items="center" hug="both">
      <Frame w={18} h={18}
             bg="var:checkbox/checked/background/default"
             stroke="var:checkbox/checked/border/default" strokeWeight={1.5}
             rounded="var:border-radius/XXXXL"
             items="center" justify="center">
        <Frame w={8} h={8} bg="var:checkbox/checked/icon/default"
               rounded="var:border-radius/XXXXL" />
      </Frame>
      <Text color="var:checkbox/checked/text/default" fontSize={14}>Radio label</Text>
    </Frame>
  `,

  switch: `
    <Frame flex="row" gap={8} items="center" hug="both">
      <Frame w={44} h={24}
             bg="var:switch/track/on/background/default"
             rounded="var:border-radius/XXXXL"
             items="center" justify="end" px={2}>
        <Frame w={20} h={20} bg="var:switch/thumb/default"
               rounded="var:border-radius/XXXXL" />
      </Frame>
      <Text color="var:content/text/primary" fontSize={14}>Toggle</Text>
    </Frame>
  `,

  slider: `
    <Frame flex="col" gap={8} w={240} hug="height">
      <Frame flex="row" items="center" gap={0} w={240} h={20}>
        <Frame w={140} h={4} bg="var:switch/track/on/background/default"
               rounded="var:border-radius/XXXXL" />
        <Frame w={100} h={4} bg="var:switch/track/off/background/default"
               rounded="var:border-radius/XXXXL" />
        <Frame w={20} h={20} bg="var:switch/thumb/default"
               stroke="var:checkbox/checked/border/default" strokeWeight={1.5}
               rounded="var:border-radius/XXXXL"
               x={130} />
      </Frame>
    </Frame>
  `,

  'search-input': `
    <Frame flex="row" bg="var:input/background/default"
           stroke="var:input/border/default" strokeWeight={1}
           rounded="var:border-radius/S" px={12} py={10}
           w={240} items="center" gap={8} hug="height">
      <Icon name="lucide:search" size={16} color="var:input/icon/default" />
      <Text color="var:input/text/default" fontSize={14} grow={1}>Search...</Text>
    </Frame>
  `,

  'date-input': `
    <Frame flex="col" gap={4} hug="both">
      <Text color="var:input/lable/text/default" fontSize={12} fontWeight={500}>Date</Text>
      <Frame flex="row" bg="var:input/background/default"
             stroke="var:input/border/default" strokeWeight={1}
             rounded="var:border-radius/S" px={12} py={10}
             w={240} items="center" gap={8}>
        <Text color="var:input/text/default" fontSize={14} grow={1}>DD / MM / YYYY</Text>
        <Icon name="lucide:calendar" size={16} color="var:input/icon/default" />
      </Frame>
    </Frame>
  `,

  'file-upload': `
    <Frame flex="col" bg="var:input/background/default"
           stroke="var:input/border/default" strokeWeight={1}
           rounded="var:border-radius/M" p={24}
           w={280} items="center" justify="center" gap={8}>
      <Icon name="lucide:upload-cloud" size={32} color="var:content/icon/secondary" />
      <Text color="var:content/text/primary" fontSize={14} fontWeight={500}>
        Drop files here
      </Text>
      <Text color="var:content/text/secondary" fontSize={12}>
        or click to browse
      </Text>
    </Frame>
  `,

  'color-input': `
    <Frame flex="row" bg="var:input/background/default"
           stroke="var:input/border/default" strokeWeight={1}
           rounded="var:border-radius/S" px={12} py={10}
           w={160} items="center" gap={8} hug="height">
      <Frame w={20} h={20} bg="#2D98B4" rounded="var:border-radius/XXS" />
      <Text color="var:input/text/filled" fontSize={14} grow={1}>#2D98B4</Text>
    </Frame>
  `,

  // ── Display ───────────────────────────────────────────────────────────────

  card: `
    <Frame flex="col" bg="var:card/background/primary"
           stroke="var:card/border/primary" strokeWeight={1}
           rounded="var:border-radius/M" p={16} gap={12} w={320} hug="height">
      <Frame w={288} h={160} bg="var:content/surfase/default"
             rounded="var:border-radius/S" />
      <Frame flex="col" gap={4} hug="both">
        <Text color="var:content/text/primary" fontWeight={600} fontSize={16}>
          Card title
        </Text>
        <Text color="var:content/text/secondary" fontSize={14}>
          Card description text goes here.
        </Text>
      </Frame>
    </Frame>
  `,

  badge: `
    <Frame flex="row" bg="var:badge/nile-blue/filled/background/default"
           rounded="var:border-radius/XXXXL" px={8} py={4}
           items="center" gap={4} hug="both">
      <Text color="var:badge/nile-blue/text/default"
            fontSize={12} fontWeight={500}>Badge</Text>
    </Frame>
  `,

  avatar: `
    <Frame w={40} h={40} bg="var:sidebar/avatar/background/default"
           rounded="var:border-radius/XXXXL"
           items="center" justify="center">
      <Text color="var:sidebar/avatar/text/default"
            fontSize={14} fontWeight={600}>AB</Text>
    </Frame>
  `,

  tooltip: `
    <Frame flex="col" gap={4} hug="both">
      <Frame flex="row" bg="#1E2430"
             rounded="var:border-radius/XS" px={8} py={6}
             items="center" hug="both">
        <Text color="#FFFFFF" fontSize={12}>Tooltip text</Text>
      </Frame>
      <Frame w={8} h={4} bg="#1E2430" rounded="var:border-radius/none"
             x={12} />
    </Frame>
  `,

  'stat-card': `
    <Frame flex="col" bg="var:card/background/primary"
           stroke="var:card/border/primary" strokeWeight={1}
           rounded="var:border-radius/M" p={20} gap={4} w={200} hug="height">
      <Text color="var:content/text/secondary" fontSize={12} fontWeight={500}>
        Metric name
      </Text>
      <Text color="var:content/text/primary" fontSize={28} fontWeight={700}>
        1,234
      </Text>
      <Frame flex="row" gap={4} items="center" hug="both">
        <Icon name="lucide:trending-up" size={14} color="#26752F" />
        <Text color="#26752F" fontSize={12}>+12.5%</Text>
      </Frame>
    </Frame>
  `,

  // ── Layout ────────────────────────────────────────────────────────────────

  divider: `
    <Frame w={320} h={1} bg="var:content/border/default" />
  `,

  // ── Navigation ────────────────────────────────────────────────────────────

  breadcrumb: `
    <Frame flex="row" gap={4} items="center" hug="both">
      <Text color="var:breadcrumbs/text/default" fontSize={14}>Home</Text>
      <Icon name="lucide:chevron-right" size={14} color="var:breadcrumbs/icon/default" />
      <Text color="var:breadcrumbs/text/default" fontSize={14}>Section</Text>
      <Icon name="lucide:chevron-right" size={14} color="var:breadcrumbs/icon/default" />
      <Text color="var:breadcrumbs/text/secondary" fontSize={14}>Current Page</Text>
    </Frame>
  `,

  navbar: `
    <Frame flex="row" bg="var:sidebar/background/default"
           stroke="var:sidebar/border/default" strokeWeight={1}
           px={16} py={12} w={1024} items="center" gap={16} hug="height">
      <Text color="var:sidebar/logo/text/default"
            fontSize={16} fontWeight={700} grow={0}>Logo</Text>
      <Frame flex="row" gap={4} items="center" grow={1}>
        <Frame flex="row" bg="var:sidebar/menuitem/background/active"
               stroke="var:sidebar/menuitem/border/active" strokeWeight={1}
               rounded="var:border-radius/XS" px={12} py={6} hug="both">
          <Text color="var:sidebar/menuitem/text/active" fontSize={14}>Home</Text>
        </Frame>
        <Frame flex="row" rounded="var:border-radius/XS" px={12} py={6} hug="both">
          <Text color="var:sidebar/menuitem/text/default" fontSize={14}>About</Text>
        </Frame>
        <Frame flex="row" rounded="var:border-radius/XS" px={12} py={6} hug="both">
          <Text color="var:sidebar/menuitem/text/default" fontSize={14}>Docs</Text>
        </Frame>
      </Frame>
      <Frame flex="row" bg="var:button/filled/accent/background/default"
             rounded="var:border-radius/S" px={12} py={6} hug="both">
        <Text color="var:button/filled/accent/text/default" fontSize={14}>Sign In</Text>
      </Frame>
    </Frame>
  `,

  sidebar: `
    <Frame flex="col" bg="var:sidebar/background/default"
           stroke="var:sidebar/border/default" strokeWeight={1}
           w={240} h={480} p={8} gap={2}>
      <Frame flex="row" px={12} py={8} items="center" gap={8} hug="height" w={224}>
        <Text color="var:sidebar/logo/text/default"
              fontSize={16} fontWeight={700} grow={1}>Logo</Text>
      </Frame>
      <Frame w={224} h={1} bg="var:sidebar/border/default" />
      <Frame flex="col" gap={2} hug="both">
        <Frame flex="row" bg="var:sidebar/menuitem/background/active"
               stroke="var:sidebar/menuitem/border/active" strokeWeight={1}
               rounded="var:border-radius/XS" px={12} py={8}
               w={224} items="center" gap={8}>
          <Icon name="lucide:layout-dashboard" size={16}
                color="var:sidebar/menuitem/icon/active" />
          <Text color="var:sidebar/menuitem/text/active" fontSize={14} grow={1}>
            Dashboard
          </Text>
        </Frame>
        <Frame flex="row" bg="var:sidebar/menuitem/background/default"
               rounded="var:border-radius/XS" px={12} py={8}
               w={224} items="center" gap={8}>
          <Icon name="lucide:users" size={16}
                color="var:sidebar/menuitem/icon/default" />
          <Text color="var:sidebar/menuitem/text/default" fontSize={14} grow={1}>
            Users
          </Text>
        </Frame>
        <Frame flex="row" bg="var:sidebar/menuitem/background/default"
               rounded="var:border-radius/XS" px={12} py={8}
               w={224} items="center" gap={8}>
          <Icon name="lucide:settings" size={16}
                color="var:sidebar/menuitem/icon/default" />
          <Text color="var:sidebar/menuitem/text/default" fontSize={14} grow={1}>
            Settings
          </Text>
        </Frame>
      </Frame>
    </Frame>
  `,

  tabs: `
    <Frame flex="col" w={400} hug="height">
      <Frame flex="row" stroke="var:content/border/default" strokeWeight={1}
             w={400} items="end">
        <Frame flex="row" px={16} py={10}
               stroke="var:button/filled/accent/background/default"
               strokeWeight={2} items="center" hug="both">
          <Text color="var:button/filled/accent/background/default"
                fontSize={14} fontWeight={500}>Tab One</Text>
        </Frame>
        <Frame flex="row" px={16} py={10} items="center" hug="both">
          <Text color="var:content/text/secondary" fontSize={14}>Tab Two</Text>
        </Frame>
        <Frame flex="row" px={16} py={10} items="center" hug="both">
          <Text color="var:content/text/secondary" fontSize={14}>Tab Three</Text>
        </Frame>
      </Frame>
      <Frame flex="col" p={16} bg="var:card/background/primary" w={400} hug="height">
        <Text color="var:content/text/secondary" fontSize={14}>
          Tab panel content
        </Text>
      </Frame>
    </Frame>
  `,

  pagination: `
    <Frame flex="row" gap={4} items="center" hug="both">
      <Frame flex="row" stroke="var:content/border/default" strokeWeight={1}
             rounded="var:border-radius/XS" w={32} h={32}
             items="center" justify="center">
        <Icon name="lucide:chevron-left" size={16} color="var:content/text/secondary" />
      </Frame>
      <Frame flex="row" bg="var:button/filled/accent/background/default"
             rounded="var:border-radius/XS" w={32} h={32}
             items="center" justify="center">
        <Text color="var:button/filled/accent/text/default" fontSize={14}>1</Text>
      </Frame>
      <Frame flex="row" stroke="var:content/border/default" strokeWeight={1}
             rounded="var:border-radius/XS" w={32} h={32}
             items="center" justify="center">
        <Text color="var:content/text/primary" fontSize={14}>2</Text>
      </Frame>
      <Frame flex="row" stroke="var:content/border/default" strokeWeight={1}
             rounded="var:border-radius/XS" w={32} h={32}
             items="center" justify="center">
        <Text color="var:content/text/primary" fontSize={14}>3</Text>
      </Frame>
      <Frame flex="row" stroke="var:content/border/default" strokeWeight={1}
             rounded="var:border-radius/XS" w={32} h={32}
             items="center" justify="center">
        <Icon name="lucide:chevron-right" size={16} color="var:content/text/secondary" />
      </Frame>
    </Frame>
  `,

  // ── Feedback ──────────────────────────────────────────────────────────────

  alert: `
    <Frame flex="row" bg="var:accordion/background/success"
           stroke="var:accordion/border/success" strokeWeight={1}
           rounded="var:border-radius/S" px={16} py={12}
           w={400} items="start" gap={12} hug="height">
      <Icon name="lucide:check-circle" size={18} color="#26752F" />
      <Frame flex="col" gap={2} grow={1} hug="height">
        <Text color="var:content/text/primary" fontSize={14} fontWeight={500}>
          Success
        </Text>
        <Text color="var:content/text/secondary" fontSize={13}>
          Action completed successfully.
        </Text>
      </Frame>
    </Frame>
  `,

  toast: `
    <Frame flex="row" bg="var:toast/base/background/default"
           stroke="var:content/border/default" strokeWeight={1}
           rounded="var:border-radius/S" px={16} py={12}
           w={360} items="start" gap={12} hug="height"
           shadow="0 4px 16px rgba(0,0,0,0.1)">
      <Frame w={4} h={40} bg="var:toast/success/indicator/border/default"
             rounded="var:border-radius/XXXXL" />
      <Frame flex="col" gap={2} grow={1} hug="height">
        <Text color="var:toast/base/text/default" fontSize={14} fontWeight={500}>
          Notification title
        </Text>
        <Text color="var:content/text/secondary" fontSize={13}>
          This is a description message.
        </Text>
      </Frame>
      <Icon name="lucide:x" size={16} color="var:content/icon/secondary" />
    </Frame>
  `,

  spinner: `
    <Frame w={32} h={32} items="center" justify="center">
      <Icon name="lucide:loader-2" size={24} color="var:button/filled/accent/background/default" />
    </Frame>
  `,

  skeleton: `
    <Frame flex="col" gap={12} w={280} hug="height">
      <Frame w={280} h={14} bg="var:content/surfase/default"
             rounded="var:border-radius/XXXXL" />
      <Frame w={240} h={14} bg="var:content/surfase/default"
             rounded="var:border-radius/XXXXL" />
      <Frame w={200} h={14} bg="var:content/surfase/default"
             rounded="var:border-radius/XXXXL" />
    </Frame>
  `,

  progress: `
    <Frame flex="col" gap={8} w={280} hug="height">
      <Frame flex="row" items="center" gap={8} w={280} hug="height">
        <Text color="var:content/text/secondary" fontSize={12} grow={1}>Loading…</Text>
        <Text color="var:content/text/secondary" fontSize={12}>65%</Text>
      </Frame>
      <Frame w={280} h={6} bg="var:switch/track/off/background/default"
             rounded="var:border-radius/XXXXL">
        <Frame w={182} h={6} bg="var:switch/track/on/background/default"
               rounded="var:border-radius/XXXXL" />
      </Frame>
    </Frame>
  `,

  'empty-state': `
    <Frame flex="col" w={320} items="center" gap={16} py={48} hug="height">
      <Frame w={64} h={64} bg="var:content/surfase/default"
             rounded="var:border-radius/XXXXL"
             items="center" justify="center">
        <Icon name="lucide:inbox" size={28} color="var:content/icon/secondary" />
      </Frame>
      <Frame flex="col" items="center" gap={4} hug="both">
        <Text color="var:content/text/primary" fontSize={16} fontWeight={600}>
          Nothing here yet
        </Text>
        <Text color="var:content/text/secondary" fontSize={14}>
          Add your first item to get started.
        </Text>
      </Frame>
      <Frame flex="row" bg="var:button/filled/accent/background/default"
             rounded="var:border-radius/S" px={16} py={8} hug="both">
        <Text color="var:button/filled/accent/text/default" fontSize={14}>
          Add Item
        </Text>
      </Frame>
    </Frame>
  `,

  // ── Overlay ───────────────────────────────────────────────────────────────

  modal: `
    <Frame flex="col" bg="var:modal/background/primary"
           stroke="var:modal/border/default" strokeWeight={1}
           rounded="var:border-radius/L" w={480} hug="height"
           shadow="0 20px 60px rgba(0,0,0,0.15)">
      <Frame flex="row" px={24} py={20} items="center" gap={8} w={480} hug="height">
        <Text color="var:modal/text/primary" fontWeight={600} fontSize={18} grow={1}>
          Dialog title
        </Text>
        <Icon name="lucide:x" size={18} color="var:modal/icon/secondary" />
      </Frame>
      <Frame w={480} h={1} bg="var:modal/border/default" />
      <Frame flex="col" px={24} py={16} gap={4} w={480} hug="height">
        <Text color="var:modal/text/secondary" fontSize={14}>
          Describe what this dialog does and what the user needs to know.
        </Text>
      </Frame>
      <Frame w={480} h={1} bg="var:modal/border/default" />
      <Frame flex="row" bg="var:modal/background/secondary" px={24} py={16}
             gap={8} justify="end" rounded="var:border-radius/L" w={480} hug="height">
        <Frame flex="row"
               bg="var:button/outline/secondary/background/default"
               stroke="var:button/outline/secondary/border/default" strokeWeight={1}
               rounded="var:border-radius/S" px={16} py={8} hug="both">
          <Text color="var:button/outline/secondary/text/default" fontSize={14}>
            Cancel
          </Text>
        </Frame>
        <Frame flex="row" bg="var:button/filled/accent/background/default"
               rounded="var:border-radius/S" px={16} py={8} hug="both">
          <Text color="var:button/filled/accent/text/default" fontSize={14}>
            Confirm
          </Text>
        </Frame>
      </Frame>
    </Frame>
  `,

  drawer: `
    <Frame flex="col" bg="var:modal/background/primary"
           stroke="var:modal/border/default" strokeWeight={1}
           w={360} h={480}>
      <Frame flex="row" px={20} py={16} items="center" gap={8}
             w={360} hug="height">
        <Text color="var:modal/text/primary" fontWeight={600} fontSize={16} grow={1}>
          Drawer title
        </Text>
        <Icon name="lucide:x" size={18} color="var:modal/icon/secondary" />
      </Frame>
      <Frame w={360} h={1} bg="var:modal/border/default" />
      <Frame flex="col" p={20} gap={16} grow={1} w={360} hug="height">
        <Text color="var:modal/text/secondary" fontSize={14}>
          Drawer content goes here.
        </Text>
      </Frame>
    </Frame>
  `,

  popover: `
    <Frame flex="col" bg="var:modal/background/primary"
           stroke="var:modal/border/default" strokeWeight={1}
           rounded="var:border-radius/M" p={16} w={240} hug="height"
           shadow="0 8px 24px rgba(0,0,0,0.1)">
      <Text color="var:modal/text/primary" fontSize={14} fontWeight={500}>
        Popover title
      </Text>
      <Text color="var:modal/text/secondary" fontSize={13}>
        Short description or action options.
      </Text>
    </Frame>
  `,

  // ── Data ──────────────────────────────────────────────────────────────────

  table: `
    <Frame flex="col" bg="var:card/background/primary"
           stroke="var:card/border/primary" strokeWeight={1}
           rounded="var:border-radius/M" w={600} hug="height">
      <Frame flex="row" bg="var:card/background/secondary"
             px={16} py={12} w={600} items="center" gap={0}>
        <Text color="var:content/text/primary" fontSize={13} fontWeight={600} w={200}>Name</Text>
        <Text color="var:content/text/primary" fontSize={13} fontWeight={600} w={200}>Status</Text>
        <Text color="var:content/text/primary" fontSize={13} fontWeight={600} w={200}>Date</Text>
      </Frame>
      <Frame w={600} h={1} bg="var:card/border/primary" />
      <Frame flex="row" px={16} py={12} w={600} items="center" gap={0}>
        <Text color="var:content/text/primary" fontSize={13} w={200}>John Smith</Text>
        <Text color="#26752F" fontSize={13} w={200}>Active</Text>
        <Text color="var:content/text/secondary" fontSize={13} w={200}>2024-01-15</Text>
      </Frame>
      <Frame w={600} h={1} bg="var:content/border/default" />
      <Frame flex="row" px={16} py={12} w={600} items="center" gap={0}>
        <Text color="var:content/text/primary" fontSize={13} w={200}>Jane Doe</Text>
        <Text color="var:content/text/secondary" fontSize={13} w={200}>Inactive</Text>
        <Text color="var:content/text/secondary" fontSize={13} w={200}>2024-01-10</Text>
      </Frame>
    </Frame>
  `,

  'list-item': `
    <Frame flex="row" bg="var:list/background/default"
           stroke="var:list/border/default" strokeWeight={1}
           rounded="var:border-radius/S" px={16} py={12}
           w={320} items="center" gap={12} hug="height">
      <Frame w={36} h={36} bg="var:content/surfase/default"
             rounded="var:border-radius/XXXXL"
             items="center" justify="center">
        <Icon name="lucide:user" size={18} color="var:content/icon/primary" />
      </Frame>
      <Frame flex="col" gap={2} grow={1} hug="height">
        <Text color="var:content/text/primary" fontSize={14} fontWeight={500}>
          List item title
        </Text>
        <Text color="var:content/text/secondary" fontSize={12}>
          Secondary description
        </Text>
      </Frame>
      <Icon name="lucide:chevron-right" size={16} color="var:content/icon/secondary" />
    </Frame>
  `,

  accordion: `
    <Frame flex="col" bg="var:accordion/background/default"
           stroke="var:accordion/border/default" strokeWeight={1}
           rounded="var:border-radius/S" w={400} hug="height">
      <Frame flex="row" px={16} py={14} items="center" gap={8}
             w={400} hug="height">
        <Text color="var:content/text/primary" fontSize={14} fontWeight={500} grow={1}>
          Accordion item
        </Text>
        <Icon name="lucide:chevron-down" size={16} color="var:content/icon/primary" />
      </Frame>
      <Frame w={400} h={1} bg="var:accordion/border/default" />
      <Frame flex="col" px={16} py={12} w={400} hug="height">
        <Text color="var:content/text/secondary" fontSize={14}>
          Expanded content goes here.
        </Text>
      </Frame>
    </Frame>
  `,
}
