// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  // This is how you will normally render submenu
  {
    label: dictionary['navigation'].dashboards,
    suffix: {
      label: '5',
      color: 'error'
    },
    icon: 'tabler-smart-home',
    children: [
      // This is how you will normally render menu item
      {
        label: dictionary['navigation'].crm,
        icon: 'tabler-circle',
        href: '/dashboards/crm'
      },
      {
        label: dictionary['navigation'].analytics,
        icon: 'tabler-circle',
        href: '/dashboards/analytics'
      },
   
    
      
    ]
  },


  // This is how you will normally render menu section
  {
    label: dictionary['navigation'].appsPages,
    isSection: true,
    children: [
  
     
      {
        label: dictionary['navigation'].email,
        icon: 'tabler-mail',
        href: '/apps/email',
        exactMatch: false,
        activeUrl: '/apps/email'
      },
      {
        label: dictionary['navigation'].chat,
        icon: 'tabler-message-circle-2',
        href: '/apps/chat'
      },
      {
        label: dictionary['navigation'].calendar,
        icon: 'tabler-calendar',
        href: '/apps/calendar'
      },
      
      {
        label: dictionary['navigation'].invoice,
        icon: 'tabler-file-description',
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/invoice/list'
          },
          {
            label: dictionary['navigation'].preview,
            icon: 'tabler-circle',
            href: '/apps/invoice/preview/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/preview'
          },
          {
            label: dictionary['navigation'].edit,
            icon: 'tabler-circle',
            href: '/apps/invoice/edit/4987',
            exactMatch: false,
            activeUrl: '/apps/invoice/edit'
          },
          {
            label: dictionary['navigation'].add,
            icon: 'tabler-circle',
            href: '/apps/invoice/add'
          }
        ]
      },
      {
        label: dictionary['navigation'].user,
        icon: 'tabler-user',
        children: [
          {
            label: dictionary['navigation'].list,
            icon: 'tabler-circle',
            href: '/apps/user/list'
          },
          {
            label: dictionary['navigation'].view,
            icon: 'tabler-circle',
            href: '/apps/user/view'
          }
        ]
      },
     
   
   
 
     
    ]
  },
 
 
   
]

export default verticalMenuData
