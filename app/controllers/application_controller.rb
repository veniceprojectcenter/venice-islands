class ApplicationController < ActionController::Base
  before_action :set_og_tags

  def set_og_tags
    @current_url = "https://islands.veniceprojectcenter.org"
    @current_url = request.url if request.url =~ /(veniceprojectcenter.org|localhost)/
    @current_url = "https://"+@current_url.gsub("https://","").gsub("http://","")
    @image = "https://islands.veniceprojectcenter.org/image/ogimage.png"
    @descr = "The Isolario Interattivo is an interactive map that can be used to display complex information on the islands of the city of Venice and its outer lagoon."
    @title = "Islands - Venice Project Center"
    set_meta_tags(
      {
        site: @title,
        description: @descr,
        keywords: 'venice islands,venice project center,vpc',
        authors: 'Venice Project Center',
        canonical: @current_url,
        image: @image,
        og: {
          title: @title,
          type: "website",
          description: @descr,
          locale: "en",
          url: @current_url,
          image: {
            _: @image,
            alt: @title,
          },
          fb:{
            pages:  '1374459902807079',
            app_id: '279763959442696'
          },
        },
        twitter: {
            card:  "summary",
            site:  @current_url,
            title: @title,
            description: @descr,
            image: {
              _:   @image,
              alt: @title
            }
        },
        icon: [
          { href: '/image/apple-icon-114x114.png', sizes: '32x32', type: 'image/png'                                           },
          { href: '/image/apple-icon-114x114.png', sizes: '16x16', type: 'image/png'                                           },
          { href: '/image/apple-icon-114x114.png', rel: 'apple-touch-icon', sizes: '180x180', type: 'image/png'             }, 
          { href: '/image/apple-icon-114x114.png', rel: 'apple-touch-icon-precomposed', sizes: '180x180', type: 'image/png' },
        ]
      }
    )
  end
end
