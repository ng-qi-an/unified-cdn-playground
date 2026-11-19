import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";

const samplePhotos = ["desert-road.jpg", "forest.jpg", "singapore-1.jpg", "singapore-2.jpg", "singapore-3.jpg", "snowy-forest.jpg", "village.jpg"]

export default function SamplePhotos({children}: {children: React.ReactNode}) {
    return <Popover>
        <PopoverTrigger nativeButton={false} render={<span/>}>
            {children}
        </PopoverTrigger>
        <PopoverContent className="w-full max-w-[300px] sm:max-w-[400px]">
            <PopoverHeader>
                <PopoverTitle>Sample Photos</PopoverTitle>
                <PopoverDescription>
                    <span className="hidden sm:block">Drag these photos into the space below to upload it.</span>
                    <span className="block sm:hidden">Click and download these photos, then upload them.</span>
                </PopoverDescription>
            </PopoverHeader>
            <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-auto">
                {samplePhotos.map((photo)=>{
                    return <img onClick={()=> window.open(`/samples/photos/${photo}`)} key={photo} src={`/samples/photos/${photo}`} alt={photo} className="rounded-lg aspect-3/2 object-cover cursor-pointer" title="Open photo"/>
                })}
            </div>
        </PopoverContent>
    </Popover>
}