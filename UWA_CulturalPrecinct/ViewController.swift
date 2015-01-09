//
//  ViewController.swift
//  UWA_CulturalPrecinct
//
//  Created by Henry Chen on 17/12/2014.
//  Copyright (c) 2014 Henry Chen. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var webView: UIWebView!
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        webView.scrollView.bounces = false
        let url = NSBundle.mainBundle().URLForResource("HTML/home", withExtension:"html")
        let request = NSURLRequest(URL: url!)
        
        
        self.webView.loadRequest(request)
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


}

