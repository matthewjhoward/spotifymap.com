import pandas as pd
import requests
import json
import io
import os
import shutil

import spotipy
from spotipy.oauth2 import SpotifyClientCredentials

import yaml
from collections import defaultdict
from bs4 import BeautifulSoup

class Scraper:

    
    
    def __init__(self, verbose=False):
        self.verbose = verbose
        
        self.dirname = os.path.dirname(os.path.abspath(__file__))
        self.config = self.config_scraper()

        self.spotify = spotipy.Spotify(client_credentials_manager=SpotifyClientCredentials(client_id=self.config['SPOTIPY']['SPOTIPY_CLIENT_ID'], client_secret=self.config['SPOTIPY']['SPOTIPY_CLIENT_SECRET']))
        self.countries = []
        self.track_data = {}
        self.broken_links = []
        

        cpath = self.config['COUNTRY_PATH']
        if os.path.exists(cpath):
            self.countries = self.readJSON(cpath)
        else:
            self.countries = self.update_country_list()

        tpath = self.config['TRACKS_PATH']
        if os.path.exists(tpath):
            self.track_data = self.readJSON(tpath)

        lpath = self.config['BROKEN_LINKS_PATH']
        if os.path.exists(lpath):
            self.broken_links = self.readJSON(lpath)

    
    def config_scraper(self):
        pd.set_option('mode.chained_assignment', None)
        config = {}
        with open(os.path.join(self.dirname, "config.yaml"), 'r') as stream:
            try:
                config = yaml.safe_load(stream)
            except yaml.YAMLError as exc:
                print(exc)

        for c in config:
            if 'DIR' in c:
                os.makedirs(config[c], exist_ok=True)
            
            if c == 'SPOTIPY_CREDENTIALS_PATH':
                creds = {}
                with open(os.path.join(self.dirname, config[c]), 'r') as stream:
                    try:
                        creds = yaml.safe_load(stream)
                    except yaml.YAMLError as exc:
                        print(exc)
        if creds:
            config['SPOTIPY']=creds

        return config

    
    def update_country_list(self):
        page = requests.get(self.config['CHARTS_URL'])
        soup = BeautifulSoup(page.content, 'html.parser')
        items = soup.find('ul').find_all('li')
        codes = [c.attrs['data-value'] for c in items]

        self.writeJSON(codes, self.config['COUNTRY_PATH'])
        
        return codes

    def update_track_data(self, tracks):
        for track in tracks:
            if pd.isna(track) or track=='':
                self.track_data[track] = track #can't write the NaN value though
            elif track not in self.track_data:
                self.track_data[track]=self.pull_track_data(track)
        
        data = self.track_data
        data.pop('NaN', None)
        data.pop('', None)
        self.writeJSON(data, self.config['TRACKS_PATH'])



    def readJSON(self, path):
        data = None
        with open(os.path.join(self.dirname, path), 'r') as fin:
            data = json.load(fin)
        return data

    def writeJSON(self, data, path):
        with open(os.path.join(self.dirname, path), 'w') as fout:
            json.dump(data, fout)

    def getCountries(self):
        return self.countries

    def getTrackData(self):
        return self.track_data

    def pull_track_data(self, track_id):
        track, artist, img_link = '','',''

        try:
            track_data = self.spotify.track(track_id)
            track = track_data['name']
            artist = track_data['artists'][0]['name']
            img_link = track_data['album']['images'][1]['url']


        except Exception:
            print(track_id)
            print(self.spotify.track(track_id))
            raise
        
        track_dict = {'track': track, 'artist': artist, 'img_link': img_link}
        return track_dict


    #expects string format date
    def downloadChart(self, date, region='global', freq='daily', chart='regional', save = False):
        date = pd.to_datetime(date)
        delta = pd.datetime.now()-date
        date = str(date.date())
        


        url_params = [self.config['CHARTS_URL'], chart, region, freq, date, 'download']
        url = f'{"/".join(url_params)}'
        if url in self.broken_links:
            if self.verbose:
                print(f'Broken Link ({url}) ignoring...')
            return None

        df = None

        if self.verbose:
            print(f'Downloading chart: {url}')
        try:
            csv_data = io.StringIO(requests.get(url, timeout=10).text)
            skiprows = chart == 'regional' #need to skip 1 for normal chart, not for viral
            try:
                df = pd.read_csv(csv_data, skiprows=skiprows)
            except pd.errors.ParserError:
                df = None
                if delta.days > 30: #add links to ignore in the future if they are not valid after 30 days
                    self.broken_links.append(url)
                print('Chart unavailable')
        except:
            print(f'Unable to connect... {url}')
            # self.broken_links.append(url)
        
        if df is not None:
            df.URL = df.URL.fillna('')
            try:
                df['date'] = [date]*len(df)
                df['id'] = [region]*len(df)
                df['track_id'] = [x[-1] for x in df.URL.str.split('/')]  
            except TypeError:
                print(url)
                print(df)

            df = df.drop(columns=['URL'])

            
        return df

    def computeTops(self, save=False, doLoad=False):        
        reg_df, vir_df = pd.read_pickle(os.path.join(self.dirname, self.config['DF_DIR'], 'regional.pkl')), pd.read_pickle(os.
        path.join(self.dirname, self.config['DF_DIR'], 'viral.pkl'))

        reg_df = reg_df.drop(columns=['Artist', 'Track Name'])
        vir_df = vir_df.drop(columns=['Artist', 'Track Name'])
        
        tops = None
        tops_path = os.path.join(self.dirname, self.config['DF_DIR'], 'tops.pkl')
        top_df = None

        if os.path.exists(tops_path) and doLoad:
            tops = pd.read_pickle(tops_path)
            reg_df = reg_df[~reg_df.date.isin(tops.date.unique())]
            vir_df = vir_df[~vir_df.date.isin(tops.date.unique())]

        if not reg_df.empty:
            #Select only the #1 tracks
            top_df, next_df, top_vir = (
                reg_df[reg_df.Position == 1], 
                reg_df[reg_df.Position == 2],
                vir_df[vir_df.Position == 1].drop_duplicates() 
                )
            

            # top_df['top200'] = top_df.apply(lambda row: 
            #     reg_df[ (reg_df.id == row.id) & (reg_df.date == row.date)].Streams.sum(), axis=1)
            top_df['lead'] = top_df.apply(lambda row: 
                    row.Streams - next_df[(next_df.id == row.id) & (next_df.date == row.date)].Streams,
                    axis=1)
            # top_df['topShare'] = top_df['Streams']/top_df['top200']


            vTrackID = top_df.apply(lambda row: 
                        top_vir[ (top_vir.id == row.id) & (top_vir.date == row.date)]['track_id'],
                        axis = 1)

            top_df['v_track_id'] = vTrackID


            #handle the case where we have viral data, but no regional data (see 'EE' 03/29/2020)
            vir_keys = list(vir_df.groupby(['date', 'id']).groups.keys())
            reg_keys = list(reg_df.groupby(['date', 'id']).groups.keys())
            missing = [x for x in vir_keys if x not in reg_keys]
            for (date, reg) in missing:
                fill = None
                row = vir_df[(vir_df.date == date) & (vir_df.id == reg)].iloc[0]
                fill_data = {key: fill for key in top_df.columns}
                fill_data['date'], fill_data['id'], fill_data['Streams'], fill_data['lead'] = date, reg, 0, 0,
                # fill_data['top200'], fill_data['topShare'] = 0, 0
                
                fill_data['v_track_id'] = row['track_id']

                top_df = top_df.append(fill_data, ignore_index=True)

            renames = {
                'Streams': 'streams'
            }
            
            top_df = top_df.rename(columns=renames).reset_index(drop=True).drop(columns=['Position'])

            
            # self.update_track_data(pd.unique(top_df[['track_id', 'v_track_id']].values.ravel('K')))

            top_df['id'] = top_df['id'].str.upper()

                    
        if tops is not None:
            if top_df is not None:
                top_df = pd.concat([tops, top_df], sort=True)
            else:
                top_df = tops

        good_cols = ['date', 'id', 'lead', 'streams', 'top1', 'top200', 'topShare', 'track_id','v_track_id']
        bad_cols = [col for col in top_df.columns if col not in good_cols]
        top_df = top_df.drop(columns=bad_cols)

        top_df = top_df.sort_values(['date', 'id'], ascending=[True, False]).reset_index(drop=True).fillna('')

        top_df = top_df[~top_df.id.isin([x.upper() for x in self.config['IGNORE_REGIONS']])]

        if save:
            top_df.to_pickle(tops_path)

        self.update_track_data(pd.unique(top_df[['track_id', 'v_track_id']].values.ravel('K')))

        return top_df

    

    
    def exportJS2(self, df):
        df = df.sort_values(['date'], ascending=[True]).reset_index(drop=True)
        groups = df.groupby(['id', 'date'])
        outData = defaultdict(dict)

        for (region, date), group in groups:
            group = group.drop(columns=['id', 'date'])
            outData[region][date]=group.to_dict(orient='records')[0] #should be 1:1 with region_date and records

        outData = dict(outData)

        js_output = 'export default '+json.dumps(outData)
        with open(os.path.join(self.dirname, self.config['CHART_DATA_OUTPUT_PATH']), 'w') as fout:
            fout.write(js_output)
        
        return outData

    def exportHighlights(self):
        tops = pd.read_pickle(os.path.join(self.dirname, self.config['DF_DIR'], 'tops.pkl'))
        reg = pd.read_pickle(os.path.join(self.dirname, self.config['DF_DIR'], 'regional.pkl'))
        vir = pd.read_pickle(os.path.join(self.dirname, self.config['DF_DIR'], 'viral.pkl'))

        def countryTrackInfo():

            groups = tops.groupby(['id', 'track_id'])
            d = defaultdict(dict)
            
            for (reg, tid), group in groups:
                group = group.drop(columns=['id', 'track_id'])
                d[reg][tid] = {}

                date_groups = group.groupby(['date'])
                for date, date_group in date_groups:
                    date_group = date_group.drop(columns=['date'])
                    d[reg][tid][date]=date_group.to_dict(orient='records')[0]['streams']
            
            v_groups = tops.groupby(['id', 'v_track_id'])
            vd = defaultdict(dict)
            for (reg, vid), group in v_groups:
                if vid:
                    vd[reg][vid]=list(group.date.unique())
            vd = dict(vd)
            
            all_data = {}

            for key in d.keys():
                all_data[key]={'top': d[key], 'viral': vd[key]}

            return all_data
        
        


        


        def trackPositionInfo():
            #Construct global position tables
            reg_globs = reg[reg.id == 'global']
            vir_globs = vir[vir.id == 'global']
            
            global_positions = {'top': {}, 'viral': {}}

            reg_global_groups = reg_globs.groupby(['date', 'track_id'])
            vir_global_groups = vir_globs.groupby(['date', 'track_id'])

            for (date, tid), group in reg_global_groups:
                global_positions['top'][(date, tid)] = int(group.iloc[0].Position)

            for (date, tid), group in vir_global_groups:
                global_positions['viral'][(date, tid)] = int(group.iloc[0].Position)
                
            
            number_ones = reg[reg.Position==1]
            groups = number_ones.groupby(['date', 'track_id'])

            vir_number_ones = vir[vir.Position==1]
            vir_groups = vir_number_ones.groupby(['date', 'track_id'])
                
            data = defaultdict(dict)

            for (date, tid), group in groups:
                countries_on_top = len(group[group.id != 'global'].id.unique())#might need to drop global somewhere before
                reg_pos = global_positions['top'].get((date,tid), 201)
                vir_pos = global_positions['viral'].get((date,tid), 201)

                data[date][tid]= {'top_regions': countries_on_top, 
                                'global_position': {'top': reg_pos, 'viral': vir_pos}, 
                                'viral_regions': 0}



            for (date, tid), group in vir_groups:
                countries_on_top = len(group[group.id != 'global'].id.unique())


                existing = data[date].get(tid, None)
                if existing:
                    existing['viral_regions']=countries_on_top
                    data[date][tid]=existing
                else:
                    reg_pos = global_positions['top'].get((date,tid), 201)
                    vir_pos = global_positions['viral'].get((date,tid), 201)
                    data[date][tid]= {'top_regions': 0, 
                                'global_position': {'top': reg_pos, 'viral': vir_pos}, 
                                'viral_regions': countries_on_top}
                    
            return dict(data)
        

        countryTrackData = countryTrackInfo()
        js_output = 'export default '+json.dumps(countryTrackData)
        with open(os.path.join(self.dirname, self.config['COUNTRY_TRACK_INFO_PATH']), 'w') as fout:
            fout.write(js_output)

        trackPositionData = trackPositionInfo()
        js_output = 'export default '+json.dumps(trackPositionData)
        with open(os.path.join(self.dirname, self.config['TRACK_POSITION_INFO_PATH']), 'w') as fout:
            fout.write(js_output)





        
    #Should make or update two PKL files (one for each chart)
    #Regions is all by default. End_Date is latest by default (i.e. 1 day before script run)
    def scrape(self, start_date, end_date=None, regions=None):
        end_date = end_date if end_date else pd.datetime.today() - pd.Timedelta(days=1)
        dates = [str(date.date()) for date in pd.date_range(start_date, end_date)]
        regions = regions if regions else [x for x in self.countries if x not in self.config['IGNORE_REGIONS']]
        updated = False
        invalid_items = {}
        thresh = 100
        for chart in self.config['CHARTS']:
            #Load chart data frame
            pkl_path = os.path.join(self.dirname, self.config['DF_DIR'], f'{chart}.pkl')
            df = None
            existing = []
            if os.path.exists(pkl_path):
                df = pd.read_pickle(pkl_path)
                df = df.dropna()
                #check for existing data (don't want duplicates)
                existing = list(df.groupby(['date', 'id']).groups.keys())

            
            count = 0 
            concats = []
            for region in regions:
                for date in dates:
                    if (date, region) not in existing: 
                        dl = self.downloadChart(date, region, chart=chart)
                        
                        if dl is not None:
                            count +=1
                            concats.append(dl)
                            
                #make some incremental updates in case of unforeseen errors
                if len(concats)>0 and count>=thresh:
                    if self.verbose:
                        print(f'Incremental save to: {pkl_path}')
                    count = 0
                    df = pd.concat([df]+concats, sort=False) if df is not None else pd.concat(concats, sort=False)
                    df = df.dropna().drop_duplicates()
                    df.to_pickle(pkl_path)
                    concats=[]
                    updated=True
                    print('updated')

            if len(concats)>0:
                df = pd.concat([df]+concats, sort=False) if df is not None else pd.concat(concats, sort=False)
                df = df.dropna().drop_duplicates()
                updated=True
                print('updated 2')

            if updated:
                df.to_pickle(pkl_path)

            invalid_items[chart] = self.validateData(df, regions, dates)
            
        #Return a chart-keyed dict with any missing data (date, region) pairs, or nothing if OK.
        # return invalid_items if any(invalid_items.values()) else None

        return updated
            

    def validateData(self, df, regions, dates):
        keys = list(df.groupby(['date', 'id']).groups.keys())
        invalid = []
        for date in dates:
            for reg in regions:
                tup = (date, reg)
                if tup not in keys:
                    invalid.append(tup)
        return invalid

    



    def exportBrokenLinks(self):
        self.writeJSON(self.broken_links, self.config['BROKEN_LINKS_PATH'])
 
    def copyForBuild(self):
        #Copy generated necessary files into the website for build
        if os.path.exists(self.config['COPY_EXPORT_PATH']):
            shutil.rmtree(self.config['COPY_EXPORT_PATH'])
        shutil.copytree(self.config['EXPORTS_DIR'], self.config['COPY_EXPORT_PATH'] )


def main():
    scraper = Scraper(verbose=True)
    print('Downloading missing data...')
    updated = scraper.scrape(scraper.config['DATA_START_DATE'])
    scraper.exportBrokenLinks()
    
    if updated:
        print('Computing data for export..')
        data = scraper.computeTops(save=True, doLoad=False)
        

        print('Exporting data...')
        output = scraper.exportJS2(data)
        scraper.exportHighlights()
        
        print('Copying data for build')
        scraper.copyForBuild()
        
    else:
        print('Nothing to update.')
    
    print('...complete!')
    

if __name__ == "__main__":
    main()
            
